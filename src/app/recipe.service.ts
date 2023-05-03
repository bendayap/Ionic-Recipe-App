import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, switchMap, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Recipe, ExtendedIngredients } from './recipe/recipe.modal';

import { AngularFireStorage } from '@angular/fire/compat/storage';

//dummy data
const dummyRecipes = [
  new Recipe(
    1,
    'API Fetched',
    '1',
    'Delicious Food',
    ['west', 'vegen', 'test1'],
    'https://lh3.googleusercontent.com/FH3Xh863EOSybiz4RSaFMyj-Xw2MLRWyRDqkwDC3NRHEe_NDhxuuivLrcXvoEW03Edws9HIAgHunFPwIoyMlKdxc-8lAIHyRmw=w1667-h1667-c-rj-v1-e365',
    ['bread', 'meat'],
    '<p>Step 1: Coat the cubed potatoes with the flour and then place in the slow cooker.</p><p>Step 2: Add red onion, bouillon cubes, bacon bits, and pepper over the potatoes.</p><p><ins><ins><ins><iframe width="320" height="100" frameborder="0" marginwidth="0" marginheight="0" vspace="0" hspace="0" allowtransparency="true" scrolling="no" allowfullscreen="true" id="aswift_0" name="aswift_0" style="max-width: 100%; left: 0px; position: absolute; top: 0px;"></iframe></ins></ins></ins></p><p>Step 3: Pour water over the mixture and cook on low for 8 hours.</p><p>Step 4: Add half-and-half, stirring well, and cook for another 30 minutes to thicken.</p><p>Step 5: Ladle soup into bowls and serve topped with green onion tops, cheddar cheese, and sour cream.</p>'
  ),
  new Recipe(
    1,
    'Created',
    'created2',
    'test2',
    [
      'east',
      'vegen',
      'test1',
      'test2',
      'test3',
      'test4',
      'test5',
      'testlatestla',
    ],
    'https://www.acouplecooks.com/wp-content/uploads/2018/08/Falafel-Salad-011.jpg',
    ['bread', 'meat'],
    '<p>step 1: no</p><p>step 2: eat</p>'
  ),
  new Recipe(
    1,
    'Created',
    'created3',
    'test3',
    ['west', 'non-vegen', 'test1', 'test2'],
    'https://images.immediate.co.uk/production/volatile/sites/30/2013/05/Cheeseburger-3d7c922.jpg?quality=90&resize=556,505',
    ['bread', 'meat', 'burger'],
    '<p>step 1: no</p><p>step 2: enjoy</p>'
  ),
  new Recipe(
    1,
    'API Fetched',
    '4',
    'test4',
    ['fast food', 'non-vegen', 'kids enjoyable', 'test2', 'test3'],
    'https://images.says.com/uploads/story_source/source_image/1104511/d560.jpeg',
    ['bread', 'meat', 'burger'],
    '<p>step 1: buy from Mcd</p><p>step 2: enjoy</p>'
  ),
];

interface RecipeData {
  id: number;
  title: string;
  dishTypes: string[];
  image: string;
  extendedIngredients: ExtendedIngredients[];
  instructions: string;
}

interface FirebaseRecipeData {
  version: number;
  creation: string;
  title: string;
  dishTypes: string[];
  image: string;
  ingredients: string[];
  instructions: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private _recipes = new BehaviorSubject<Recipe[]>([]);
  private _isMyRecipe = new BehaviorSubject<boolean>(false);
  private numOfRecipe = 5;
  firebaseUrl =
    'https://ionic-recipe-app-f5a31-default-rtdb.asia-southeast1.firebasedatabase.app/created-recipes';

  constructor(private http: HttpClient, private storage: AngularFireStorage) {}

  get recipes() {
    return this._recipes.asObservable();
  }

  get isMyRecipe() {
    return this._isMyRecipe.asObservable();
  }

  getDummyData() {
    this._recipes.next(dummyRecipes);
  }

  fetchRandomRecipes() {
    return this.http
      .get<{ recipes: RecipeData[] }>(
        `https://api.spoonacular.com/recipes/random?number=${this.numOfRecipe}&apiKey=${environment.recipeApiKey}`
      )
      .pipe(
        map((resData) => {
          const recipes: Recipe[] = [];
          resData.recipes.map((recipeData) =>
            recipes.push(
              new Recipe(
                1,
                'API Fetched',
                recipeData.id.toString(),
                recipeData.title,
                recipeData.dishTypes,
                recipeData.image,
                recipeData.extendedIngredients.map((ingredient) => {
                  return ingredient.name;
                }),
                recipeData.instructions
              )
            )
          );
          return recipes;
        }),
        tap((recipes) => {
          this._recipes.next(recipes);
        })
      );
  }

  fetchCreatedRecipes() {
    return this.http
      .get<{ [key: string]: FirebaseRecipeData }>(`${this.firebaseUrl}.json`)
      .pipe(
        map((resData) => {
          let recipe: Recipe;
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              recipe = new Recipe(
                resData[key].version,
                resData[key].creation,
                key,
                resData[key].title,
                resData[key].dishTypes,
                resData[key].image,
                resData[key].ingredients,
                resData[key].instructions
              );
              this._recipes.next([...this._recipes.value, recipe]);
            }
          }
        })
      );
  }

  getRecipe(id: string) {
    return this._recipes.value.find((recipe) => recipe.id === id);
  }

  async uploadFile(id: any, file: string | any[]): Promise<any> {
    if (file && file.length) {
      try {
        const task = await this.storage.ref('images').child(id).put(file[0]);
        // return lastValueFrom(this.storage.ref(`images/${id}`).getDownloadURL());
        return this.storage.ref(`images/${id}`).getDownloadURL().toPromise();
      } catch (error) {
        console.log(error);
      }
    }
  }

  addRecipe(newRecipe: Recipe, imageUrl: string) {
    newRecipe.image = imageUrl;

    return this.http
      .put<{ name: string }>(`${this.firebaseUrl}/${newRecipe.id}.json`, {
        ...newRecipe,
        id: null,
      })
      .pipe(
        switchMap(() => {
          return this._recipes;
        }),
        take(1),
        tap(() => {
          this._recipes.next([...this._recipes.value, newRecipe]);
        })
      );
  }

  updateRecipe(updatedRecipe: Recipe) {
    let updatedRecipes: Recipe[];

    const recipes = this._recipes.value;
    const updatedRecipeIndex = recipes.findIndex(
      (recipe) => recipe.id === updatedRecipe.id
    );
    updatedRecipes = [...recipes];
    updatedRecipes[updatedRecipeIndex] = updatedRecipe;
    this._recipes.next(updatedRecipes);
    return this.http.put<{ name: string }>(
      `${this.firebaseUrl}/${updatedRecipe.id}.json`,
      {
        ...updatedRecipe,
        id: null,
      }
    );
  }

  deleteRecipe(recipeId: string) {
    this.storage.ref(`created-recipes/${recipeId}`).delete();
    this._recipes.next(
      this._recipes.value.filter((recipe: any) => recipe.id !== recipeId)
    );
    return this.http.delete(`${this.firebaseUrl}/${recipeId}.json`);
  }

  onSwitchToRecipeList() {
    this._isMyRecipe.next(false);
  }

  onSwitchToMyRecipe() {
    this._isMyRecipe.next(true);
  }
}
