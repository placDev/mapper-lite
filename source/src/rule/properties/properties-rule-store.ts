import { PropertyRule } from "./property-rule";

export class PropertiesRuleStore {
  private store = new Map<string, Map<string, PropertyRule>>();

  isEmpty() {
    return this.store.size == 0;
  }

  addRule(
    propertyFrom: string,
    propertyTo: string,
    transform?: (...arg: any[]) => any,
  ) {
    this.initialFromState(propertyFrom);

    const fromState = this.store.get(propertyFrom) as Map<string, PropertyRule>;
    if (fromState.has(propertyTo)) {
      throw new Error("Данное правило для свойства уже добавленно в маппер");
    }

    const newRule = new PropertyRule(propertyFrom, propertyTo, transform);
    fromState.set(propertyTo, newRule);

    return newRule;
  }

  getPropertyRules(): Array<PropertyRule> {
    return [...this.store.values()].flatMap((x) => [...x.values()]);
  }

  private initialFromState(propertyFrom: string) {
    if (!this.store.has(propertyFrom)) {
      this.store.set(propertyFrom, new Map<string, PropertyRule>());
    }
  }
}
