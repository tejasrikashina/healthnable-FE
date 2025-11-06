import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FloorComponent } from './floor/floor.component';
import { AddFloorComponent } from './floor/add-floor/add-floor.component';
import { EditFloorComponent } from './floor/edit-floor/edit-floor.component';
import { BedComponent } from './bed/bed.component';
import { EditBedComponent } from './bed/edit-bed/edit-bed.component';
import { AddBedComponent } from './bed/add-bed/add-bed.component';
import { EditWardComponent } from './ward/edit-ward/edit-ward.component';
import { AddWardComponent } from './ward/add-ward/add-ward.component';
import { WardComponent } from './ward/ward.component';
import { NurseComponent } from './nurse/nurse.component';
import { AddNurseComponent } from './nurse/add-nurse/add-nurse.component';
import { EditNurseComponent } from './nurse/edit-nurse/edit-nurse.component';
import { RoomComponent } from './room/room.component';
import { AddRoomComponent } from './room/add-room/add-room.component';
import { EditRoomComponent } from './room/edit-room/edit-room.component';


const routes: Routes = [
  {
    path: '',
    children: [
      { path:'floor',component:FloorComponent},
     {
            path: 'floor/add-floor',
            component: AddFloorComponent,
          },
          {
            path: 'floor/edit-floor',
            component: EditFloorComponent,
          },
          { path:'bed',component:BedComponent},
           {
            path: 'bed/add-bed',
            component: AddBedComponent,
          },
          {
            path: 'bed/edit-bed',
            component: EditBedComponent,
          },
             { path:'ward',component:WardComponent},
           {
            path: 'ward/add-ward',
            component: AddWardComponent,
          },
          {
            path: 'ward/edit-ward',
            component: EditWardComponent,
          },
           { path:'nurse',component:NurseComponent},
           {
            path: 'nurse/add-nurse',
            component: AddNurseComponent,
          },
          {
            path: 'nurse/edit-nurse',
            component: EditNurseComponent,
          },
            { path:'room',component:RoomComponent},
           {
            path: 'room/add-room',
            component: AddRoomComponent,
          },
          {
            path: 'room/edit-room',
            component: EditRoomComponent,
          },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfrastructureRoutingModule {}
