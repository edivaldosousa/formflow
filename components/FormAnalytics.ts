// FormAnalytics.ts - Analytics tracking system for forms

export interface FormResponse {
  id: string;
  formId: string;
  userId?: string;
  data: Record<string, any>;
  createdAt: number;
  completionTime: number;
}

export interface FormMetrics {
  totalResponses: number;
  completionRate: number;
  averageCompletionTime: number;
  startedButNotCompleted: number;
  fieldDropOffRate: Record<string, number>;
}

export interface FieldAnalytics {
  fieldId: string;
  fieldName: string;
  totalResponses: number;
  filledResponses: number;
  emptyResponses: number;
  mostCommonValue?: string;
  averageValue?: number;
}

class FormAnalytics {
  private responses: FormResponse[] = [];

  trackResponse(response: FormResponse): void {
    this.responses.push(response);
  }

  getFormMetrics(formId: string): FormMetrics {
    const formResponses = this.responses.filter(r => r.formId === formId);
    const completedResponses = formResponses.filter(r => r.completionTime > 0);

    const totalTime = completedResponses.reduce((sum, r) => sum + r.completionTime, 0);
    const avgTime = completedResponses.length > 0 ? totalTime / completedResponses.length : 0;

    return {
      totalResponses: formResponses.length,
      completionRate: formResponses.length > 0 ? (completedResponses.length / formResponses.length) * 100 : 0,
      averageCompletionTime: Math.round(avgTime / 1000),
      startedButNotCompleted: formResponses.length - completedResponses.length,
      fieldDropOffRate: this.calculateFieldDropoff(formId),
    };
  }

  private calculateFieldDropoff(formId: string): Record<string, number> {
    const dropoff: Record<string, number> = {};
    const formResponses = this.responses.filter(r => r.formId === formId);
    const totalResponses = formResponses.length;

    formResponses.forEach(response => {
      Object.keys(response.data).forEach(fieldId => {
        if (!response.data[fieldId]) {
          dropoff[fieldId] = (dropoff[fieldId] || 0) + 1;
        }
      });
    });

    Object.keys(dropoff).forEach(fieldId => {
      dropoff[fieldId] = (dropoff[fieldId] / totalResponses) * 100;
    });

    return dropoff;
  }

  getFieldAnalytics(formId: string, fieldId: string): FieldAnalytics | null {
    const formResponses = this.responses.filter(r => r.formId === formId);
    const fieldValues = formResponses.map(r => r.data[fieldId]).filter(v => v !== undefined);
    const filledResponses = fieldValues.filter(v => v && v !== '').length;

    if (formResponses.length === 0) return null;

    return {
      fieldId,
      fieldName: fieldId,
      totalResponses: formResponses.length,
      filledResponses,
      emptyResponses: formResponses.length - filledResponses,
      mostCommonValue: this.getMostCommonValue(fieldValues),
    };
  }

  private getMostCommonValue(values: any[]): string | undefined {
    if (values.length === 0) return undefined;
    const frequency: Record<string, number> = {};
    values.forEach(v => {
      frequency[v] = (frequency[v] || 0) + 1;
    });
    return Object.keys(frequency).reduce((a, b) => (frequency[a] > frequency[b] ? a : b));
  }

  getResponses(formId: string): FormResponse[] {
    return this.responses.filter(r => r.formId === formId);
  }

  clearResponses(formId: string): void {
    this.responses = this.responses.filter(r => r.formId !== formId);
  }
}

export const createAnalytics = (): FormAnalytics => new FormAnalytics();
export default FormAnalytics;
