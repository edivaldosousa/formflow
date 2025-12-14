// FormLogicEngine.ts - Conditional logic system for form fields

export interface LogicCondition {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  value?: any;
}

export interface LogicRule {
  id: string;
  name: string;
  conditions: LogicCondition[];
  conditionOperator: 'AND' | 'OR';
  actions: LogicAction[];
}

export interface LogicAction {
  type: 'show' | 'hide' | 'enable' | 'disable' | 'setValue' | 'clearValue' | 'focus';
  targetFieldId: string;
  value?: any;
}

class FormLogicEngine {
  private rules: Map<string, LogicRule> = new Map();
  private fieldValues: Map<string, any> = new Map();

  addRule(rule: LogicRule): void {
    this.rules.set(rule.id, rule);
  }

  updateFieldValue(fieldId: string, value: any): void {
    this.fieldValues.set(fieldId, value);
  }

  private evaluateCondition(condition: LogicCondition): boolean {
    const fieldValue = this.fieldValues.get(condition.fieldId);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'notEquals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'greaterThan':
        return Number(fieldValue) > Number(condition.value);
      case 'lessThan':
        return Number(fieldValue) < Number(condition.value);
      case 'isEmpty':
        return !fieldValue || fieldValue === '' || fieldValue.length === 0;
      case 'isNotEmpty':
        return fieldValue && fieldValue !== '' && fieldValue.length > 0;
      default:
        return false;
    }
  }

  evaluateRule(rule: LogicRule): boolean {
    const results = rule.conditions.map(condition => this.evaluateCondition(condition));

    if (rule.conditionOperator === 'AND') {
      return results.every(result => result === true);
    } else {
      return results.some(result => result === true);
    }
  }

  applyLogic(): LogicAction[] {
    const actionsToApply: LogicAction[] = [];

    for (const rule of this.rules.values()) {
      if (this.evaluateRule(rule)) {
        actionsToApply.push(...rule.actions);
      }
    }

    return actionsToApply;
  }

  clearRules(): void {
    this.rules.clear();
  }

  getRule(ruleId: string): LogicRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): LogicRule[] {
    return Array.from(this.rules.values());
  }
}

export const createLogicEngine = (): FormLogicEngine => new FormLogicEngine();
export default FormLogicEngine;
