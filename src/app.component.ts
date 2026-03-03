import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NpkMonitorComponent } from './components/npk-monitor.component';
import { TankMonitorComponent } from './components/tank-monitor.component';
import { RatioGeneratorComponent } from './components/ratio-generator.component';
import { SoilGuideComponent } from './components/soil-guide.component';
import { MotorControlComponent } from './components/motor-control.component';
import { PlantAnalyserComponent } from './components/plant-analyser.component';
import { WeatherForecastComponent } from './components/weather-forecast.component';
import { CropAdvisorComponent } from './components/crop-advisor.component';
import { DataService, Tab } from './services/data.service';
import { TranslationService, Language } from './services/translation.service';
import { TranslatePipe } from './pipes/translate.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    NpkMonitorComponent, 
    TankMonitorComponent, 
    RatioGeneratorComponent, 
    SoilGuideComponent, 
    MotorControlComponent,
    PlantAnalyserComponent,
    WeatherForecastComponent,
    CropAdvisorComponent,
    TranslatePipe
  ],
  template: `
    <div class="min-h-screen pb-12">
      <!-- Header -->
      <header class="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50 transition-all duration-300">
        <div class="container mx-auto px-4 h-20 flex items-center justify-between">
          <div class="flex items-center gap-3 group cursor-pointer" (click)="dataService.currentTab.set('readings')">
             <div class="w-10 h-10 bg-gradient-to-br from-[#A47E3B] to-[#8c6b32] rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#A47E3B]/20 group-hover:scale-105 transition-transform">🌱</div>
             <h1 class="text-xl md:text-2xl font-bold text-[#6A5A4F] tracking-tight group-hover:text-[#8c6b32] transition-colors">{{ 'app_title' | translate }}</h1>
          </div>
          
          <div class="flex items-center gap-6">
            <nav class="hidden lg:flex gap-2 bg-stone-100/50 p-1.5 rounded-xl border border-stone-200/50">
              <button (click)="dataService.currentTab.set('readings')" [class]="getTabClass('readings')">
                <span class="text-lg">📊</span> {{ 'nav_npk' | translate }}
              </button>
              <button (click)="dataService.currentTab.set('tank')" [class]="getTabClass('tank')">
                <span class="text-lg">💧</span> {{ 'nav_tank' | translate }}
              </button>
              <button (click)="dataService.currentTab.set('analyser')" [class]="getTabClass('analyser')">
                <span class="text-lg">🌿</span> {{ 'nav_plant_ai' | translate }}
              </button>
              <button (click)="dataService.currentTab.set('motor')" [class]="getTabClass('motor')">
                <span class="text-lg">⚙️</span> {{ 'nav_motor' | translate }}
              </button>
              <button (click)="dataService.currentTab.set('ratio')" [class]="getTabClass('ratio')">
                <span class="text-lg">⚖️</span> {{ 'nav_ratio' | translate }}
              </button>
              <button (click)="dataService.currentTab.set('guide')" [class]="getTabClass('guide')">
                <span class="text-lg">📚</span> {{ 'nav_guide' | translate }}
              </button>
              <button (click)="dataService.currentTab.set('weather')" [class]="getTabClass('weather')">
                <span class="text-lg">☁️</span> {{ 'nav_weather' | translate }}
              </button>
              <button (click)="dataService.currentTab.set('advisor')" [class]="getTabClass('advisor')">
                <span class="text-lg">💡</span> {{ 'nav_advisor' | translate }}
              </button>
            </nav>

            <!-- Language Switcher -->
            <div class="relative">
              <select 
                [value]="translationService.currentLang()" 
                (change)="changeLanguage($event)"
                class="appearance-none bg-white border border-stone-200 text-stone-700 text-sm font-medium rounded-lg focus:ring-2 focus:ring-[#A47E3B]/20 focus:border-[#A47E3B] block pl-3 pr-8 py-2 cursor-pointer hover:border-[#A47E3B] transition-colors shadow-sm"
              >
                <option value="en">🇺🇸 English</option>
                <option value="ta">🇮🇳 தமிழ்</option>
                <option value="ml">🇮🇳 മലയാളം</option>
                <option value="te">🇮🇳 తెలుగు</option>
                <option value="kn">🇮🇳 ಕನ್ನಡ</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Mobile Nav -->
        <div class="lg:hidden flex overflow-x-auto gap-3 p-3 border-t border-stone-100 bg-white/95 backdrop-blur-sm scrollbar-hide shadow-inner">
           <button (click)="dataService.currentTab.set('readings')" [class]="getMobileTabClass('readings')">📊 {{ 'mob_npk' | translate }}</button>
           <button (click)="dataService.currentTab.set('tank')" [class]="getMobileTabClass('tank')">💧 {{ 'mob_tank' | translate }}</button>
           <button (click)="dataService.currentTab.set('analyser')" [class]="getMobileTabClass('analyser')">🌿 {{ 'mob_ai' | translate }}</button>
           <button (click)="dataService.currentTab.set('motor')" [class]="getMobileTabClass('motor')">⚙️ {{ 'mob_motor' | translate }}</button>
           <button (click)="dataService.currentTab.set('ratio')" [class]="getMobileTabClass('ratio')">⚖️ {{ 'mob_calc' | translate }}</button>
           <button (click)="dataService.currentTab.set('guide')" [class]="getMobileTabClass('guide')">📚 {{ 'mob_guide' | translate }}</button>
           <button (click)="dataService.currentTab.set('weather')" [class]="getMobileTabClass('weather')">☁️ {{ 'mob_weather' | translate }}</button>
           <button (click)="dataService.currentTab.set('advisor')" [class]="getMobileTabClass('advisor')">💡 {{ 'mob_advisor' | translate }}</button>
        </div>
      </header>

      <!-- Content Area -->
      <main class="container mx-auto px-4 py-8">
        @switch (dataService.currentTab()) {
          @case ('readings') {
            <app-npk-monitor />
          }
          @case ('tank') {
            <app-tank-monitor />
          }
          @case ('analyser') {
            <app-plant-analyser />
          }
          @case ('motor') {
            <app-motor-control />
          }
          @case ('ratio') {
            <app-ratio-generator />
          }
          @case ('guide') {
            <app-soil-guide />
          }
          @case ('weather') {
            <app-weather-forecast />
          }
          @case ('advisor') {
            <app-crop-advisor />
          }
        }
      </main>
    </div>
  `
})
export class AppComponent {
  dataService = inject(DataService);
  translationService = inject(TranslationService);

  changeLanguage(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.translationService.setLanguage(select.value as Language);
  }

  getTabClass(tab: Tab): string {
    const base = "px-4 py-2 rounded-lg font-medium transition-all text-sm whitespace-nowrap flex items-center gap-2 ";
    return this.dataService.currentTab() === tab
      ? base + "bg-white text-[#A47E3B] shadow-sm ring-1 ring-black/5 font-bold"
      : base + "text-stone-500 hover:bg-white/50 hover:text-stone-700";
  }

  getMobileTabClass(tab: Tab): string {
    const base = "flex-1 px-3 py-2 rounded-md font-medium text-xs whitespace-nowrap ";
    return this.dataService.currentTab() === tab
      ? base + "bg-[#A47E3B] text-white"
      : base + "bg-white text-stone-600 border border-stone-200";
  }
}