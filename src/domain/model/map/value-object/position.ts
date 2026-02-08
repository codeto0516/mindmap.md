/** イミュータブルな座標。将来 ViewState のズームと分離しやすい。 */
export interface Position {
  readonly x: number;
  readonly y: number;
}

export const createPosition = (x: number, y: number): Position => ({ x, y });
