export class SplineInterpolator {
  private points: Float32Array;
  private angles: Float32Array;
  private readonly maxPoints: number;
  private readonly tension: number;
  private pointCount: number = 0;
  private readonly coefficients: Float32Array;
  private readonly steps: number;
  private readonly angleSmoothing: number = 0.5;

  constructor(maxPoints = 4, tension = 0.5, steps = 5) {
    this.maxPoints = maxPoints;
    this.tension = tension;
    this.steps = steps;
    this.points = new Float32Array(maxPoints * 2);
    this.angles = new Float32Array(maxPoints);
    
    this.coefficients = new Float32Array(steps * 4);
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const t2 = t * t;
      const t3 = t2 * t;
      
      this.coefficients[i * 4] = 0.5 * (-t3 + 2*t2 - t);
      this.coefficients[i * 4 + 1] = 0.5 * (3*t3 - 5*t2 + 2);
      this.coefficients[i * 4 + 2] = 0.5 * (-3*t3 + 4*t2 + t);
      this.coefficients[i * 4 + 3] = 0.5 * (t3 - t2);
    }
  }

  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  private interpolateAngle(a1: number, a2: number, t: number): number {
    const diff = this.normalizeAngle(a2 - a1);
    return a1 + diff * t;
  }

  addPoint(x: number, y: number): void {
    if (this.pointCount > 0) {
      const prevX = this.points[this.pointCount * 2 - 2];
      const prevY = this.points[this.pointCount * 2 - 1];
      const currentAngle = Math.atan2(y - prevY, x - prevX);
      
      if (this.pointCount > 1) {
        const prevAngle = this.angles[this.pointCount - 1];
        const smoothedAngle = this.interpolateAngle(
          prevAngle,
          currentAngle,
          this.angleSmoothing
        );
        this.angles[this.pointCount - 1] = smoothedAngle;
      }
      
      if (this.pointCount === this.maxPoints) {
        this.points.copyWithin(0, 2, this.maxPoints * 2);
        this.angles.copyWithin(0, 1);
        this.points[this.maxPoints * 2 - 2] = x;
        this.points[this.maxPoints * 2 - 1] = y;
        this.angles[this.maxPoints - 1] = currentAngle;
      } else {
        this.points[this.pointCount * 2] = x;
        this.points[this.pointCount * 2 + 1] = y;
        this.angles[this.pointCount] = currentAngle;
        this.pointCount++;
      }
    } else {
      this.points[0] = x;
      this.points[1] = y;
      this.angles[0] = 0;
      this.pointCount++;
    }
  }

  clear(): void {
    this.pointCount = 0;
  }

  getInterpolatedPoints(): { positions: Float32Array; angles: Float32Array } {
    if (this.pointCount < 2) {
      return {
        positions: new Float32Array(0),
        angles: new Float32Array(0)
      };
    }

    const resultPoints = new Float32Array((this.pointCount - 1) * this.steps * 2);
    const resultAngles = new Float32Array((this.pointCount - 1) * this.steps);
    let resultIndex = 0;
    let angleIndex = 0;

    if (this.pointCount === 2) {
      const x0 = this.points[0], y0 = this.points[1];
      const x1 = this.points[2], y1 = this.points[3];
      const angle = Math.atan2(y1 - y0, x1 - x0);
      const dx = x1 - x0, dy = y1 - y0;

      for (let i = 0; i < this.steps; i++) {
        const t = i / (this.steps - 1);
        resultPoints[resultIndex++] = x0 + dx * t;
        resultPoints[resultIndex++] = y0 + dy * t;
        resultAngles[angleIndex++] = angle;
      }
      
      return {
        positions: resultPoints,
        angles: resultAngles
      };
    }

    for (let i = 0; i < this.pointCount - 1; i++) {
      const p0 = i > 0 ? i - 1 : 0;
      const p1 = i;
      const p2 = i + 1;
      const p3 = i + 2 < this.pointCount ? i + 2 : i + 1;

      const x0 = this.points[p0 * 2], y0 = this.points[p0 * 2 + 1];
      const x1 = this.points[p1 * 2], y1 = this.points[p1 * 2 + 1];
      const x2 = this.points[p2 * 2], y2 = this.points[p2 * 2 + 1];
      const x3 = this.points[p3 * 2], y3 = this.points[p3 * 2 + 1];

      const a0 = this.angles[p0];
      const a1 = this.angles[p1];
      const a2 = this.angles[p2];
      const a3 = this.angles[p3];

      for (let j = 0; j < this.steps; j++) {
        const coeffIndex = j * 4;
        const b1 = this.coefficients[coeffIndex];
        const b2 = this.coefficients[coeffIndex + 1];
        const b3 = this.coefficients[coeffIndex + 2];
        const b4 = this.coefficients[coeffIndex + 3];

        if (j > 0 || i === 0) {
          resultPoints[resultIndex++] = b1*x0 + b2*x1 + b3*x2 + b4*x3;
          resultPoints[resultIndex++] = b1*y0 + b2*y1 + b3*y2 + b4*y3;
          
          // Interpolate angle using the same coefficients
          const interpolatedAngle = this.normalizeAngle(
            b1*a0 + b2*a1 + b3*a2 + b4*a3
          );
          resultAngles[angleIndex++] = interpolatedAngle;
        }
      }
    }

    return {
      positions: resultPoints.subarray(0, resultIndex),
      angles: resultAngles.subarray(0, angleIndex)
    };
  }
}