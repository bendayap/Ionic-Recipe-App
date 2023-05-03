import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddRecipePageRoutingModule } from './add-recipe-routing.module';

import { AddRecipePage } from './add-recipe.page';
import { SharedModule } from "../../shared/shared.module";
import { FormatFileSizePipe } from '../format-file-size.pipe';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

@NgModule({
    declarations: [AddRecipePage, FormatFileSizePipe],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AddRecipePageRoutingModule,
        ReactiveFormsModule,
        SharedModule,
        AngularFireStorageModule
    ]
})
export class AddRecipePageModule {}
