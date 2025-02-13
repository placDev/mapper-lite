import { RuleStore } from "../rule/rule-store";
import {ConstructorType} from "../utility-types";
import {ProfileMapper} from "./interfaces/profile-mapper.interface";
import {MapRule} from "../rule/map-rule";
import {plainToInstance} from "class-transformer";
import {PropertyRule} from "../rule/properties/property-rule";
import {ComplexRule} from "../rule/complexity/complex-rule";
import {Cloner} from "../utils/cloner";

export class Mapper implements ProfileMapper {
    private store = new RuleStore();

    addRule<F, T>(from: ConstructorType<F>, to: ConstructorType<T>) {
        return this.store.addRule(from, to);
    }

    getRule<F, T>(from: ConstructorType<F>, to: ConstructorType<T>) {
        return this.store.getRule(from, to);
    }

    map<V extends F, F, T>(values: V[], from: ConstructorType<F>, to: ConstructorType<T>): Promise<T[]>
    map<V extends F, F, T>(values: V, from: ConstructorType<F>, to: ConstructorType<T>): Promise<T>
    map<V extends F, F, T>(values: V | V[], from: ConstructorType<F>, to: ConstructorType<T>): Promise<T> | Promise<T[]> {
        const rule = this.getRule(from, to);
        return !Array.isArray(values) ? this.mapSingle(rule, values) : Promise.all(values.map(value => this.mapSingle(rule, value)));
    }

    autoMap<V extends Object, T>(values: V[], to: ConstructorType<T>): Promise<T[]>
    autoMap<V extends Object, T>(values: V, to: ConstructorType<T>): Promise<T>
    autoMap<V extends Object, T>(values: V | V[], to: ConstructorType<T>): Promise<T> | Promise<T[]> {
        if(Array.isArray(values) && !values.length) {
            return new Promise<T[]>((resolve, reject) => resolve([]));
        }

        this.checkObjectsIsNotAnonymous(values);

        // @ts-ignore
        const constructor = Array.isArray(values) ? values[0].constructor : values.constructor;
        // @ts-ignore
        return this.map(values, constructor, to);
    }

    private async mapSingle<F, T, V extends F>(rule: MapRule<F, T>, value: V) {
        //plainToInstance(Person, plainPerson, { excludeExtraneousValues: true })
        const raw = plainToInstance(rule.toConstructor, {})

        await this.fillProperties(raw, rule.propertiesStore.getPropertyRules(), value);
        await this.fillComplexity(raw, rule.complexityStore.getComplexRules(), value);

        return raw as T;
    }

    private checkObjectsIsNotAnonymous<V extends Object>(values: V | V[]) {
        if(Array.isArray(values) ? values.some(x => x.constructor === Object) : values.constructor === Object) {
            throw Error("Объект не является классом");
        }
    }

    private async fillProperties(raw: any, propertyRules: PropertyRule[], value: any) {
        for(let propertyRule of propertyRules) {
            if(propertyRule.isExistTransform) {
                // @ts-ignore
                raw[propertyRule.propertyTo] = await propertyRule.transform(value[propertyRule.propertyFrom], value, raw);
                continue;
            }

            // @ts-ignore
            raw[propertyRule.propertyTo] = value[propertyRule.propertyFrom];
        }
    }

    private async fillComplexity(raw: any, complexRules: ComplexRule[], value: any) {
        for(let complexRule of complexRules) {
            // TODO Реализовать для правила и трансформа
            // if(complexRule.isExistTransform) {
            //     // @ts-ignore
            //     raw[propertyRule.propertyTo] = await propertyRule.transform(value[propertyRule.propertyFrom], value, raw);
            //     continue;
            // }

            // @ts-ignore
            raw[complexRule.propertyTo] = Cloner.deep(value[complexRule.propertyFrom]);
        }
    }
}
