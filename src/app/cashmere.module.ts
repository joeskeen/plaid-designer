import {
    TileModule,
    FormFieldModule,
    ButtonModule,
    InputModule,
    PopModule,
    AccordionModule,
    ChipModule,
    IconModule,
    CheckboxModule,
} from '@healthcatalyst/cashmere';
import { NgModule } from '@angular/core';

@NgModule({
    exports: [
        TileModule,
        FormFieldModule,
        ButtonModule,
        InputModule,
        PopModule,
        AccordionModule,
        ChipModule,
        IconModule,
        CheckboxModule,
    ],
})
export class CashmereModule {}
