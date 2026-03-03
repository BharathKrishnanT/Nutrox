import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-motor-control',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="h-full">
      <header class="mb-6">
        <h2 class="text-3xl font-bold text-[#6A5A4F] mb-2">{{ 'motor_title' | translate }}</h2>
        <p class="text-stone-600">{{ 'motor_subtitle' | translate }}</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Heater Control -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 relative overflow-hidden group">
           <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <span class="text-6xl">🔥</span>
           </div>
           
           <div class="flex justify-between items-start mb-4">
             <h3 class="text-xl font-bold text-stone-700">{{ 'heater' | translate }}</h3>
             <div class="w-3 h-3 rounded-full" [class.bg-green-500]="dataService.motorStatus().heater" [class.bg-stone-300]="!dataService.motorStatus().heater"></div>
           </div>

           <div class="flex items-center justify-between mt-8">
             <span class="text-sm font-medium text-stone-500">{{ (dataService.motorStatus().heater ? 'on' : 'off') | translate }}</span>
             <label class="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" class="sr-only peer" [checked]="dataService.motorStatus().heater" (change)="toggleHeater()">
               <div class="w-14 h-7 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
             </label>
           </div>
        </div>

        <!-- Grinder Control -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 relative overflow-hidden group">
           <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <span class="text-6xl">⚙️</span>
           </div>
           
           <div class="flex justify-between items-start mb-4">
             <h3 class="text-xl font-bold text-stone-700">{{ 'grinder' | translate }}</h3>
             <div class="w-3 h-3 rounded-full" [class.bg-green-500]="dataService.motorStatus().motorA.speed > 0" [class.bg-stone-300]="dataService.motorStatus().motorA.speed === 0"></div>
           </div>

           <div class="space-y-4 mt-4">
             <div>
               <label class="text-xs font-bold text-stone-400 uppercase mb-1 block">{{ 'speed' | translate }}</label>
               <input type="range" min="0" max="255" [value]="dataService.motorStatus().motorA.speed" (input)="updateSpeed('A', $event)" class="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-600">
               <div class="text-right text-xs font-mono text-stone-500 mt-1">{{ dataService.motorStatus().motorA.speed }}</div>
             </div>
             
             <div>
                <label class="text-xs font-bold text-stone-400 uppercase mb-2 block">{{ 'direction' | translate }}</label>
                <div class="flex bg-stone-100 p-1 rounded-lg">
                  <button 
                    (click)="setDirection('A', 'forward')"
                    [class.bg-white]="dataService.motorStatus().motorA.direction === 'forward'"
                    [class.shadow-sm]="dataService.motorStatus().motorA.direction === 'forward'"
                    [class.text-stone-800]="dataService.motorStatus().motorA.direction === 'forward'"
                    class="flex-1 py-1 text-xs font-bold rounded text-stone-400 transition-all">
                    {{ 'forward' | translate }}
                  </button>
                  <button 
                    (click)="setDirection('A', 'backward')"
                    [class.bg-white]="dataService.motorStatus().motorA.direction === 'backward'"
                    [class.shadow-sm]="dataService.motorStatus().motorA.direction === 'backward'"
                    [class.text-stone-800]="dataService.motorStatus().motorA.direction === 'backward'"
                    class="flex-1 py-1 text-xs font-bold rounded text-stone-400 transition-all">
                    {{ 'backward' | translate }}
                  </button>
                </div>
             </div>
           </div>
        </div>

        <!-- Agitator Control -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 relative overflow-hidden group">
           <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <span class="text-6xl">🌪️</span>
           </div>
           
           <div class="flex justify-between items-start mb-4">
             <h3 class="text-xl font-bold text-stone-700">{{ 'agitator' | translate }}</h3>
             <div class="w-3 h-3 rounded-full" [class.bg-green-500]="dataService.motorStatus().motorB.speed > 0" [class.bg-stone-300]="dataService.motorStatus().motorB.speed === 0"></div>
           </div>

           <div class="space-y-4 mt-4">
             <div>
               <label class="text-xs font-bold text-stone-400 uppercase mb-1 block">{{ 'speed' | translate }}</label>
               <input type="range" min="0" max="255" [value]="dataService.motorStatus().motorB.speed" (input)="updateSpeed('B', $event)" class="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-600">
               <div class="text-right text-xs font-mono text-stone-500 mt-1">{{ dataService.motorStatus().motorB.speed }}</div>
             </div>
             
             <div>
                <label class="text-xs font-bold text-stone-400 uppercase mb-2 block">{{ 'direction' | translate }}</label>
                <div class="flex bg-stone-100 p-1 rounded-lg">
                  <button 
                    (click)="setDirection('B', 'forward')"
                    [class.bg-white]="dataService.motorStatus().motorB.direction === 'forward'"
                    [class.shadow-sm]="dataService.motorStatus().motorB.direction === 'forward'"
                    [class.text-stone-800]="dataService.motorStatus().motorB.direction === 'forward'"
                    class="flex-1 py-1 text-xs font-bold rounded text-stone-400 transition-all">
                    {{ 'forward' | translate }}
                  </button>
                  <button 
                    (click)="setDirection('B', 'backward')"
                    [class.bg-white]="dataService.motorStatus().motorB.direction === 'backward'"
                    [class.shadow-sm]="dataService.motorStatus().motorB.direction === 'backward'"
                    [class.text-stone-800]="dataService.motorStatus().motorB.direction === 'backward'"
                    class="flex-1 py-1 text-xs font-bold rounded text-stone-400 transition-all">
                    {{ 'backward' | translate }}
                  </button>
                </div>
             </div>
           </div>
        </div>

      </div>

      <!-- Terminal Output -->
      <div class="mt-8 bg-stone-900 rounded-xl p-4 font-mono text-xs text-green-400 h-48 overflow-y-auto shadow-inner border border-stone-700">
        <div class="flex justify-between items-center border-b border-stone-700 pb-2 mb-2">
           <span class="text-stone-400 font-bold">{{ 'controller_terminal' | translate }}</span>
           <div class="flex gap-1">
             <div class="w-2 h-2 rounded-full bg-red-500"></div>
             <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
             <div class="w-2 h-2 rounded-full bg-green-500"></div>
           </div>
        </div>
        <div class="space-y-1">
          <div class="opacity-50">> {{ 'system_init' | translate }}</div>
          <div class="opacity-50">> {{ 'connected_driver' | translate }}</div>
          @for (log of dataService.commandLog(); track log) {
            <div>> {{ log }}</div>
          }
          <div class="animate-pulse">> _</div>
        </div>
      </div>
    </div>
  `
})
export class MotorControlComponent {
  dataService = inject(DataService);

  toggleHeater() {
    this.dataService.toggleHeater();
  }

  updateSpeed(motor: 'A' | 'B', event: Event) {
    const speed = parseInt((event.target as HTMLInputElement).value);
    this.dataService.setMotorSpeed(motor, speed);
  }

  setDirection(motor: 'A' | 'B', direction: 'forward' | 'backward') {
    this.dataService.setDirection(motor, direction);
  }
}
