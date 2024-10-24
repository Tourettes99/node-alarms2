export interface NodeData {
  label: string;
  notes?: string;
  files?: File[];
  links?: string[];
  scheduledTime?: Date;
}

export interface WorkflowData {
  nodes: any[];
  edges: any[];
}