export class Recipe {
  constructor(
    public version: number,
    public creation: string,
    public id: string,
    public title: string,
    public dishTypes: string[],
    public image: string,
    public ingredients: string[],
    public instructions: string
  ) {}
}

export class ExtendedIngredients {
  constructor(
    public id: number,
    public aisle: string,
    public image: string,
    public consistency: string,
    public name: string,
    public nameClean: string,
    public original: string,
    public originalName: string,
    public amount: number,
    public unit: string,
    public meta: string[],
    public measures: Measure
  ) {}
}

class Measure {
  constructor(public us: Us, public metric: Metric) {}
}

class Us {
  constructor(
    public amount: number,
    public unitShort: string,
    public unitLong: string
  ) {}
}

class Metric {
  constructor(
    public amount: number,
    public unitShort: string,
    public unitLong: string
  ) {}
}
