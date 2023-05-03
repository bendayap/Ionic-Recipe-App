import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  NavController,
} from '@ionic/angular';
import { lastValueFrom, Subscription, timer } from 'rxjs';
import { RecipeService } from 'src/app/recipe.service';
import { Recipe } from '../recipe.modal';

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.page.html',
  styleUrls: ['./edit-recipe.page.scss'],
})
export class EditRecipePage implements OnInit, OnDestroy {
  isLoading = false;
  doUpdateImage = 'false';
  recipeId: string = '';
  recipe: Recipe | undefined;
  form!: FormGroup;
  dishTypes: string[] = [];
  ingredients: string[] = [];
  recipes: Recipe[] = [];
  selectedFile: any;
  private recipesSub = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private recipeService: RecipeService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private storage: AngularFireStorage,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.recipesSub = this.recipeService.recipes.subscribe((recipes) => {
      this.recipes = recipes;
      if (this.recipes.length <= 0) {
        this.isLoading = true;
        this.recipeService.fetchRandomRecipes().subscribe(() => {
          this.recipeService.fetchCreatedRecipes().subscribe(() => {
            this.isLoading = false;
          });
        });
        // this.recipeService.getDummyData();
        // this.recipeService.fetchCreatedRecipes().subscribe();
      }

      this.route.paramMap.subscribe((paramMap) => {
        if (!paramMap.has('recipeId')) {
          this.navCtrl.navigateBack('/recipe');
          return;
        }
        this.recipeId = paramMap.get('recipeId')!;
        this.recipe = this.recipeService.getRecipe(this.recipeId);
      });

      if (this.recipe) {
        this.form = new FormGroup({
          title: new FormControl(this.recipe?.title, {
            updateOn: 'blur',
            validators: [
              Validators.required,
              Validators.pattern('^(?=.*[a-zA-Z])[a-zA-Z0-9 ]+$'),
            ],
          }),
          dishTypes: new FormControl(this.recipe?.dishTypes.join(', '), {
            updateOn: 'blur',
            validators: [
              Validators.required,
              Validators.maxLength(100),
              Validators.pattern(/[a-zA-Z]/),
            ],
          }),
          image: new FormControl(null),
          ingredients: new FormControl(this.recipe?.ingredients.join(', '), {
            updateOn: 'blur',
            validators: [
              Validators.required,
              Validators.maxLength(100),
              Validators.pattern(/[a-zA-Z]/),
            ],
          }),
          instructions: new FormControl(this.recipe?.instructions, {
            updateOn: 'blur',
            validators: [Validators.required, Validators.maxLength(250)],
          }),
        });
      }
    });
  }

  onTestBtn() {
    console.log(this.doUpdateImage);
    console.log(typeof this.doUpdateImage);
    if (this.doUpdateImage === 'true') {
      console.log('true');
    } else {
      // console.log(!this.doUpdateImage);
      console.log('false');
    }
  }

  chooseFile(event: Event) {
    this.selectedFile = (event.target! as HTMLInputElement).files;
    this.form.patchValue({ image: this.selectedFile });
  }

  onEditRecipe() {
    this.form.value.title = this.form.value.title.trim();
    this.dishTypes = this.form.value.dishTypes
      .split(',')
      .map((dishType: string) => dishType.trim());
    this.dishTypes = this.dishTypes.filter((dishType) => {
      return dishType.match(/[a-zA-Z]/);
    });

    this.ingredients = this.form.value.ingredients
      .split(',')
      .map((ingredient: string) => ingredient.trim());
    this.ingredients = this.ingredients.filter((ingredient) => {
      return ingredient.match(/[a-zA-Z]/);
    });

    this.loadingCtrl
      .create({
        message: 'Updating recipe...',
      })
      .then(async (loadingEl) => {
        loadingEl.present();

        const updatedRecipe = new Recipe(
          this.recipe!.version + 1,
          this.recipe!.creation,
          this.recipe!.id,
          this.form.value.title,
          this.dishTypes,
          this.recipe!.image,
          this.ingredients,
          this.form.value.instructions
        );

        if (this.doUpdateImage === 'true') {
          // await this.removeImage();
          updatedRecipe.image = await this.uploadFile(
            updatedRecipe.id,
            this.selectedFile
          );
        }

        this.recipeService.updateRecipe(updatedRecipe).subscribe(() => {
          loadingEl.dismiss();
          this.form.reset();
          this.router.navigate([`/recipe/recipe-detail/${this.recipeId}`]);
        });
      });
  }

  async removeImage() {
    this.storage.ref(`created-recipes/${this.recipe!.id}`).delete();
  }

  async uploadFile(id: any, file: string | any[]): Promise<any> {
    if (file && file.length) {
      try {
        const task = await this.storage
          .ref('created-recipes')
          .child(id)
          .put(file[0]);
        return await lastValueFrom(
          this.storage.ref(`created-recipes/${id}`).getDownloadURL()
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  onDeleteRecipe() {
    this.loadingCtrl
      .create({
        message: 'Deleting recipe...',
      })
      .then(async (loadingEl) => {
        loadingEl.present();

        this.recipeService.deleteRecipe(this.recipeId).subscribe(() => {
          loadingEl.dismiss();
          this.form.reset();
          this.router.navigate(['/recipe']);
        });
      });
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Delete Recipe',
      message: 'Are you sure to delete?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.onDeleteRecipe();
          },
        },
      ],
    });

    await alert.present();
  }

  ngOnDestroy() {
    if (this.recipesSub) {
      this.recipesSub.unsubscribe();
    }
  }
}
