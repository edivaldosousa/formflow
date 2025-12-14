// FormValidator.ts - Advanced form field validation system

export interface ValidationRule {
  type: 'email' | 'phone' | 'url' | 'number' | 'text' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface ValidationError {
  fieldId: string;
  message: string;
  type: string;
}

class FormValidator {
  private rules: Map<string, ValidationRule[]> = new Map();

  addRule(fieldId: string, rule: ValidationRule): void {
    const existing = this.rules.get(fieldId) || [];
    this.rules.set(fieldId, [...existing, rule]);
  }

  validateEmail(value: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  }

  validatePhone(value: string): boolean {
    const regex = /^(\+55)?\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    return regex.test(value);
  }

  validateURL(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  validateNumber(value: string | number): boolean {
    return !isNaN(Number(value));
  }

  validateMinLength(value: string, min: number): boolean {
    return value.length >= min;
  }

  validateMaxLength(value: string, max: number): boolean {
    return value.length <= max;
  }

  validatePattern(value: string, pattern: string): boolean {
    const regex = new RegExp(pattern);
    return regex.test(value);
  }

  validateField(fieldId: string, value: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const rules = this.rules.get(fieldId) || [];

    for (const rule of rules) {
      let isValid = true;

      switch (rule.type) {
        case 'email':
          isValid = this.validateEmail(value);
          break;
        case 'phone':
          isValid = this.validatePhone(value);
          break;
        case 'url':
          isValid = this.validateURL(value);
          break;
        case 'number':
          isValid = this.validateNumber(value);
          break;
        case 'minLength':
          isValid = this.validateMinLength(value, rule.value);
          break;
        case 'maxLength':
          isValid = this.validateMaxLength(value, rule.value);
          break;
        case 'pattern':
          isValid = this.validatePattern(value, rule.value);
          break;
      }

      if (!isValid) {
        errors.push({
          fieldId,
          message: rule.message,
          type: rule.type,
        });
      }
    }

    return errors;
  }

  validateForm(formData: Record<string, string>): ValidationError[] {
    const allErrors: ValidationError[] = [];

    for (const [fieldId, value] of Object.entries(formData)) {
      const fieldErrors = this.validateField(fieldId, value);
      allErrors.push(...fieldErrors);
    }

    return allErrors;
  }

  clearRules(fieldId?: string): void {
    if (fieldId) {
      this.rules.delete(fieldId);
    } else {
      this.rules.clear();
    }
  }
}

export const createValidator = (): FormValidator => new FormValidator();
export default FormValidator;
