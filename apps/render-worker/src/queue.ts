export const RENDER_QUEUE_NAME = 'render-jobs';

export interface RenderJobPayload {
  renderJobId: string;
  projectId: string;
  editPlanId: string;
}
