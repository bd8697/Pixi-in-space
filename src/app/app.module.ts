import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { PixiComponent } from './pixi/pixi.component';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [	
    PixiComponent,
      AppComponent
   ],
  imports: [
    BrowserModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
