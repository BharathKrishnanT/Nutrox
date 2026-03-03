import { Component, ElementRef, ViewChild, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../pipes/translate.pipe';
import { DataService, SoilType, Crop, OrganicAdditive } from '../services/data.service';

declare var Chart: any;

@Component({
  selector: 'app-soil-guide',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="max-w-4xl mx-auto">
      <header class="mb-8">
        <h2 class="text-3xl font-bold text-[#6A5A4F] mb-2">{{ 'guide_title' | translate }}</h2>
        <p class="text-stone-600">{{ 'guide_subtitle' | translate }}</p>
      </header>

      <div class="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button 
          (click)="activeTab.set('soil')"
          [class.bg-[#A47E3B]]="activeTab() === 'soil'"
          [class.text-white]="activeTab() === 'soil'"
          [class.bg-white]="activeTab() !== 'soil'"
          [class.text-stone-600]="activeTab() !== 'soil'"
          class="px-6 py-2 rounded-full font-bold shadow-sm transition-colors whitespace-nowrap">
          {{ 'soil_types' | translate }}
        </button>
        <button 
          (click)="activeTab.set('crops')"
          [class.bg-[#A47E3B]]="activeTab() === 'crops'"
          [class.text-white]="activeTab() === 'crops'"
          [class.bg-white]="activeTab() !== 'crops'"
          [class.text-stone-600]="activeTab() !== 'crops'"
          class="px-6 py-2 rounded-full font-bold shadow-sm transition-colors whitespace-nowrap">
          {{ 'crop_needs' | translate }}
        </button>
        <button 
          (click)="activeTab.set('solutions')"
          [class.bg-[#A47E3B]]="activeTab() === 'solutions'"
          [class.text-white]="activeTab() === 'solutions'"
          [class.bg-white]="activeTab() !== 'solutions'"
          [class.text-stone-600]="activeTab() !== 'solutions'"
          class="px-6 py-2 rounded-full font-bold shadow-sm transition-colors whitespace-nowrap">
          {{ 'organic_solutions' | translate }}
        </button>
        <button 
          (click)="activeTab.set('references')"
          [class.bg-[#A47E3B]]="activeTab() === 'references'"
          [class.text-white]="activeTab() === 'references'"
          [class.bg-white]="activeTab() !== 'references'"
          [class.text-stone-600]="activeTab() !== 'references'"
          class="px-6 py-2 rounded-full font-bold shadow-sm transition-colors whitespace-nowrap">
          {{ 'references' | translate }}
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 min-h-[400px]">
        
        @if (activeTab() === 'soil') {
          <div class="animate-fadeIn">
            <h3 class="text-xl font-bold text-stone-800 mb-4">{{ 'soil_explorer' | translate }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                @for (soil of dataService.soils; track soil.id) {
                  <button 
                    (click)="selectedSoil.set(soil)"
                    [class.bg-stone-100]="selectedSoil() === soil"
                    class="w-full text-left p-3 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-3 border border-transparent hover:border-stone-200">
                    <div class="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-lg shadow-inner" [style.background-color]="getSoilColor(soil.id)"></div>
                    <span class="font-bold text-stone-700">{{ soil.name | translate }}</span>
                  </button>
                }
              </div>
              
              <div class="md:col-span-2 bg-stone-50 rounded-xl p-6 border border-stone-100">
                @if (selectedSoil(); as soil) {
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h4 class="text-2xl font-bold text-[#6A5A4F] mb-2">{{ soil.name | translate }}</h4>
                      <p class="text-stone-600 mb-4 leading-relaxed">{{ soil.characteristics | translate }}</p>
                    </div>
                    <div class="w-32 h-32">
                      <canvas #soilChart></canvas>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 gap-4 mb-4">
                    <div class="bg-white p-4 rounded-lg border border-stone-200">
                      <div class="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{{ 'nutrient_profile' | translate }}</div>
                      <div class="text-stone-700 text-sm" [innerHTML]="soil.profileText | translate"></div>
                    </div>
                    
                    <div class="bg-white p-4 rounded-lg border border-stone-200">
                      <div class="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{{ 'ideal_crops' | translate }}</div>
                      <div class="text-stone-700 font-medium">{{ soil.crops | translate }}</div>
                    </div>
                  </div>
                } @else {
                  <div class="h-full flex items-center justify-center text-stone-400 italic">
                    {{ 'select_soil_type' | translate }}
                  </div>
                }
              </div>
            </div>
          </div>
        }

        @if (activeTab() === 'crops') {
          <div class="animate-fadeIn">
            <h3 class="text-xl font-bold text-stone-800 mb-4">{{ 'crop_needs' | translate }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div class="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                @for (crop of dataService.crops; track crop.name) {
                  <button 
                    (click)="selectedCrop.set(crop)"
                    [class.bg-green-50]="selectedCrop() === crop"
                    class="w-full text-left p-3 rounded-xl hover:bg-green-50/50 transition-colors flex items-center gap-3 border border-transparent hover:border-green-100">
                    <span class="text-2xl">{{ getCropIcon(crop.name) }}</span>
                    <span class="font-bold text-stone-700">{{ crop.name | translate }}</span>
                  </button>
                }
              </div>

              <div class="md:col-span-2 bg-green-50/30 rounded-xl p-6 border border-green-100">
                 @if (selectedCrop(); as crop) {
                    <div class="flex items-center justify-between mb-6">
                      <div class="flex items-center gap-4">
                        <div class="text-5xl">{{ getCropIcon(crop.name) }}</div>
                        <div>
                          <h4 class="text-2xl font-bold text-green-900">{{ crop.name | translate }}</h4>
                          <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">{{ 'crop' | translate }}</span>
                        </div>
                      </div>
                      <button (click)="goToCalculator(crop)" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                        <span>🧮</span> {{ 'calculate_mix' | translate }}
                      </button>
                    </div>

                    <div class="grid grid-cols-3 gap-3 mb-6">
                       <div class="bg-white p-3 rounded-lg border border-green-100 text-center">
                          <div class="text-xs font-bold text-blue-400 mb-1">N</div>
                          <div class="font-bold text-stone-700">{{ crop.idealN }}</div>
                       </div>
                       <div class="bg-white p-3 rounded-lg border border-green-100 text-center">
                          <div class="text-xs font-bold text-orange-400 mb-1">P</div>
                          <div class="font-bold text-stone-700">{{ crop.idealP }}</div>
                       </div>
                       <div class="bg-white p-3 rounded-lg border border-green-100 text-center">
                          <div class="text-xs font-bold text-red-400 mb-1">K</div>
                          <div class="font-bold text-stone-700">{{ crop.idealK }}</div>
                       </div>
                    </div>

                    <div class="mb-6 h-64">
                      <canvas #cropChart></canvas>
                    </div>

                    <div class="space-y-4">
                      <div class="bg-white p-4 rounded-xl border border-green-100">
                        <h5 class="font-bold text-green-800 text-sm uppercase tracking-wide mb-2">{{ 'macro_nutrients' | translate }}</h5>
                        <div class="text-stone-600 text-sm leading-relaxed" [innerHTML]="crop.macro | translate"></div>
                      </div>
                      <div class="bg-white p-4 rounded-xl border border-green-100">
                        <h5 class="font-bold text-green-800 text-sm uppercase tracking-wide mb-2">{{ 'micro_nutrients' | translate }}</h5>
                        <div class="text-stone-600 text-sm leading-relaxed" [innerHTML]="crop.micro | translate"></div>
                      </div>
                    </div>

                 } @else {
                    <div class="h-full flex items-center justify-center text-stone-400 italic">
                      {{ 'select_crop_learn' | translate }}
                    </div>
                 }
              </div>
            </div>
          </div>
        }

        @if (activeTab() === 'solutions') {
           <div class="animate-fadeIn">
             <h3 class="text-xl font-bold text-stone-800 mb-4">{{ 'organic_solutions' | translate }}</h3>
             <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div class="space-y-2">
                 @for (sol of dataService.organicAdditives; track sol.id) {
                   <button 
                     (click)="selectedSolution.set(sol)"
                     [class.bg-amber-50]="selectedSolution() === sol"
                     class="w-full text-left p-3 rounded-xl hover:bg-amber-50/50 transition-colors border border-transparent hover:border-amber-100">
                     <span class="font-bold text-stone-700 block">{{ sol.name | translate }}</span>
                     <span class="text-xs text-stone-400">{{ sol.boosts | translate }}</span>
                   </button>
                 }
               </div>

               <div class="md:col-span-2 bg-amber-50/30 rounded-xl p-6 border border-amber-100">
                  @if (selectedSolution(); as sol) {
                    <div class="flex justify-between items-start mb-4">
                      <div>
                        <h4 class="text-2xl font-bold text-amber-900 mb-2">{{ sol.name | translate }}</h4>
                        <p class="text-stone-600 mb-6 leading-relaxed">{{ sol.description | translate }}</p>
                      </div>
                      <div class="w-32 h-32">
                        <canvas #solutionChart></canvas>
                      </div>
                    </div>

                    <div class="space-y-4">
                      <div class="bg-white p-4 rounded-xl border border-amber-100">
                        <h5 class="font-bold text-amber-800 text-sm uppercase tracking-wide mb-2">{{ 'nutrient_boost' | translate }}</h5>
                        <div class="flex flex-wrap gap-2">
                          @for (boost of getBoosts(sol); track boost.key) {
                            <span class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">
                              {{ boost.key }}: +{{ boost.val }}
                            </span>
                          }
                          @if (getBoosts(sol).length === 0) {
                            <span class="text-stone-400 italic">{{ 'balanced_profile' | translate }}</span>
                          }
                        </div>
                      </div>
                    </div>
                  } @else {
                    <div class="h-full flex items-center justify-center text-stone-400 italic">
                      {{ 'select_solution' | translate }}
                    </div>
                  }
               </div>
             </div>
           </div>
        }

        @if (activeTab() === 'references') {
          <div class="animate-fadeIn">
            <h3 class="text-xl font-bold text-stone-800 mb-4">{{ 'educational_resources' | translate }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="https://agricoop.nic.in/" target="_blank" class="block p-4 rounded-xl border border-stone-200 hover:border-blue-400 hover:shadow-md transition-all group">
                <div class="font-bold text-blue-600 group-hover:underline mb-1">{{ 'gov_schemes' | translate }}</div>
                <div class="text-sm text-stone-500">{{ 'dept_agri' | translate }}</div>
              </a>
              <a href="https://tnau.ac.in/" target="_blank" class="block p-4 rounded-xl border border-stone-200 hover:border-green-400 hover:shadow-md transition-all group">
                <div class="font-bold text-green-700 group-hover:underline mb-1">{{ 'agri_university' | translate }}</div>
                <div class="text-sm text-stone-500">{{ 'tnau_portal' | translate }}</div>
              </a>
              <a href="https://scholar.google.com/scholar?q=organic+farming+india" target="_blank" class="block p-4 rounded-xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all group">
                <div class="font-bold text-amber-700 group-hover:underline mb-1">{{ 'research_papers' | translate }}</div>
                <div class="text-sm text-stone-500">{{ 'latest_research' | translate }}</div>
              </a>
            </div>
            
            <div class="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 class="font-bold text-blue-800 mb-2">{{ 'disclaimer_title' | translate }}</h4>
              <p class="text-xs text-blue-700 leading-relaxed">
                {{ 'disclaimer_text' | translate }}
              </p>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class SoilGuideComponent {
  dataService = inject(DataService);
  
  activeTab = signal<'soil' | 'crops' | 'solutions' | 'references'>('soil');
  selectedSoil = signal<SoilType | null>(null);
  selectedCrop = signal<Crop | null>(null);
  selectedSolution = signal<OrganicAdditive | null>(null);

  @ViewChild('soilChart') soilChartRef?: ElementRef;
  @ViewChild('cropChart') cropChartRef?: ElementRef;
  @ViewChild('solutionChart') solutionChartRef?: ElementRef;

  private chartInstance: any = null;

  constructor() {
    effect(() => {
      const tab = this.activeTab();
      const soil = this.selectedSoil();
      const crop = this.selectedCrop();
      const sol = this.selectedSolution();

      // Small delay to allow DOM to update
      setTimeout(() => {
        if (tab === 'soil' && soil) this.renderSoilChart(soil);
        if (tab === 'crops' && crop) this.renderCropChart(crop);
        if (tab === 'solutions' && sol) this.renderSolutionChart(sol);
      }, 50);
    });
  }

  getSoilColor(id: string): string {
    const colors: Record<string, string> = {
      'Red-Soil': '#A52A2A',
      'Black-Soil': '#3C3C3C',
      'Alluvial-Soil': '#C2B280',
      'Laterite-Soil': '#D2691E'
    };
    return colors[id] || '#888888';
  }

  getCropIcon(name: string): string {
    const icons: Record<string, string> = {
      'Paddy (Rice)': '🌾',
      'Corn (Maize)': '🌽',
      'Millets (Ragi, Jowar)': '🥣',
      'Pulses (Black/Green Gram)': '🫘',
      'Groundnut (Peanut)': '🥜',
      'Potato': '🥔',
      'Banana': '🍌',
      'Chilli': '🌶️',
      'Coconut': '🥥',
      'Sugarcane': '🎋',
      'Cotton': '☁️',
      'Turmeric': '🧡'
    };
    return icons[name] || '🌱';
  }

  getBoosts(sol: OrganicAdditive) {
    return Object.entries(sol.nutrientBoost).map(([key, val]) => ({ key, val }));
  }

  goToCalculator(crop: Crop) {
    this.dataService.selectedCrop.set(crop);
    this.dataService.detectedDeficiencies.set([]); // Clear any AI deficiencies
    this.dataService.currentTab.set('ratio');
  }

  private destroyChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  private renderSoilChart(soil: SoilType) {
    if (!this.soilChartRef) return;
    this.destroyChart();

    const ctx = this.soilChartRef.nativeElement.getContext('2d');
    const labels = Object.keys(soil.profile);
    const data = Object.values(soil.profile);

    this.chartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Soil Profile',
          data: data,
          backgroundColor: 'rgba(164, 126, 59, 0.2)',
          borderColor: '#A47E3B',
          pointBackgroundColor: '#A47E3B',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#A47E3B'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: '#E5E7EB' },
            grid: { color: '#E5E7EB' },
            pointLabels: { font: { size: 10 } },
            suggestedMin: 0,
            suggestedMax: 3
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  private renderCropChart(crop: Crop) {
    if (!this.cropChartRef) return;
    this.destroyChart();

    const ctx = this.cropChartRef.nativeElement.getContext('2d');
    const labels = Object.keys(crop.needs);
    const data = Object.values(crop.needs);

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nutrient Requirement (1-3)',
          data: data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.6)', // N - Blue
            'rgba(249, 115, 22, 0.6)', // P - Orange
            'rgba(239, 68, 68, 0.6)'   // K - Red
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(249, 115, 22)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 3,
            ticks: { stepSize: 1 }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  private renderSolutionChart(sol: OrganicAdditive) {
    if (!this.solutionChartRef) return;
    this.destroyChart();

    const ctx = this.solutionChartRef.nativeElement.getContext('2d');
    
    // Base profile (Cow Dung / Compost)
    const baseLabels = ['N', 'P', 'K', 'Ca', 'S', 'Mg'];
    const baseData = [1, 1, 1, 1, 1, 1]; // Baseline

    // Additive Boost
    const boostData = baseLabels.map(label => {
      return 1 + (sol.nutrientBoost[label] || 0);
    });

    this.chartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: baseLabels,
        datasets: [
          {
            label: 'Base Compost',
            data: baseData,
            backgroundColor: 'rgba(150, 150, 150, 0.2)',
            borderColor: '#9CA3AF',
            borderDash: [5, 5],
            pointRadius: 0
          },
          {
            label: 'With Additive',
            data: boostData,
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderColor: '#F59E0B',
            pointBackgroundColor: '#F59E0B',
            pointBorderColor: '#fff'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: '#E5E7EB' },
            grid: { color: '#E5E7EB' },
            suggestedMin: 0,
            suggestedMax: 4
          }
        },
        plugins: { legend: { display: true, position: 'bottom' } }
      }
    });
  }
}
