export type nodeData = {
  type: 'SECTION' | 'OTHER';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type nodesData = {
  [id: string]: nodeData;
};
