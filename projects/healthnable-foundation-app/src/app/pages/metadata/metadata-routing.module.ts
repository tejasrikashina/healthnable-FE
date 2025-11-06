import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesComponent } from './categories/categories.component';
import { SubcategoryComponent } from './subcategory/subcategory.component';
import { AddCategoryComponent } from './categories/add-category/add-category.component';
import { AddSubcategoryComponent } from './subcategory/add-subcategory/add-subcategory.component';
import { EditCategoryComponent } from './categories/edit-category/edit-category.component';
import { EditSubcategoryComponent } from './subcategory/edit-subcategory/edit-subcategory.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'categories',
        component: CategoriesComponent,
      },
      {
        path: 'add-categories',
        component: AddCategoryComponent,
      },
      {
        path: 'edit-categories',
        component: EditCategoryComponent,
      },
      {
        path: 'add-subcategories',
        component: AddSubcategoryComponent,
      },
      {
        path: 'edit-subcategories',
        component: EditSubcategoryComponent,
      },
      {
        path: 'subcategories',
        component: SubcategoryComponent,
      },
      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MetadataRoutingModule {}
