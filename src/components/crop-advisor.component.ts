import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-crop-advisor',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, TranslatePipe],
  template: `
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Header -->
      <div class="text-center space-y-2">
        <h2 class="text-3xl font-bold text-[#6A5A4F]">{{ 'advisor_title' | translate }}</h2>
        <p class="text-stone-500">{{ 'advisor_subtitle' | translate }}</p>
      </div>

      <!-- Input Form -->
      <div class="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Location -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-stone-700">{{ 'location_label' | translate }}</label>
            <div class="relative flex gap-2">
              <div class="relative flex-1">
                <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">location_on</mat-icon>
                <input 
                  type="text" 
                  [(ngModel)]="location" 
                  [placeholder]="'location_placeholder' | translate"
                  class="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#A47E3B] focus:ring-2 focus:ring-[#A47E3B]/20 outline-none transition-all"
                />
              </div>
              <button 
                (click)="fetchLocation()" 
                [disabled]="locationLoading()"
                class="px-4 py-2 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center disabled:opacity-50"
                [title]="'use_current_location' | translate"
              >
                @if (locationLoading()) {
                  <div class="animate-spin h-5 w-5 border-2 border-stone-400 border-t-transparent rounded-full"></div>
                } @else {
                  <mat-icon>my_location</mat-icon>
                }
              </button>
            </div>
          </div>

          <!-- Land Type -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-stone-700">{{ 'land_type_label' | translate }}</label>
            <div class="relative">
              <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">landscape</mat-icon>
              <select 
                [(ngModel)]="landType"
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#A47E3B] focus:ring-2 focus:ring-[#A47E3B]/20 outline-none transition-all appearance-none bg-white"
              >
                <option value="" disabled selected>{{ 'select_land_type' | translate }}</option>
                <option value="Wetland (Nanjai)">{{ 'wetland' | translate }}</option>
                <option value="Dryland (Punjai)">{{ 'dryland' | translate }}</option>
                <option value="Garden Land (Thottam)">{{ 'garden_land' | translate }}</option>
                <option value="Hill/Slope">{{ 'hill_slope' | translate }}</option>
              </select>
            </div>
          </div>

          <!-- Soil Type -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-stone-700">{{ 'soil_type_label' | translate }}</label>
            <div class="relative">
              <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">grass</mat-icon>
              <select 
                [(ngModel)]="soilType"
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#A47E3B] focus:ring-2 focus:ring-[#A47E3B]/20 outline-none transition-all appearance-none bg-white"
              >
                <option value="" disabled selected>{{ 'select_soil_type_placeholder' | translate }}</option>
                <option value="Red Soil">{{ 'red_soil' | translate }}</option>
                <option value="Black Soil">{{ 'black_soil' | translate }}</option>
                <option value="Alluvial Soil">{{ 'alluvial_soil' | translate }}</option>
                <option value="Laterite Soil">{{ 'laterite_soil' | translate }}</option>
                <option value="Clay Soil">{{ 'clay_soil' | translate }}</option>
                <option value="Sandy Loam">{{ 'sandy_loam' | translate }}</option>
              </select>
            </div>
          </div>

          <!-- Water Availability -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-stone-700">{{ 'water_avail_label' | translate }}</label>
            <div class="relative">
              <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">water_drop</mat-icon>
              <select 
                [(ngModel)]="water"
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#A47E3B] focus:ring-2 focus:ring-[#A47E3B]/20 outline-none transition-all appearance-none bg-white"
              >
                <option value="" disabled selected>{{ 'select_water_avail' | translate }}</option>
                <option value="Abundant (Canal/Borewell)">{{ 'water_abundant' | translate }}</option>
                <option value="Moderate (Seasonal/Rainfed)">{{ 'water_moderate' | translate }}</option>
                <option value="Scarce (Dry/Drought-prone)">{{ 'water_scarce' | translate }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-end">
          <button 
            (click)="analyze()" 
            [disabled]="loading() || !isValid()"
            class="flex items-center gap-2 px-8 py-3 bg-[#A47E3B] text-white rounded-xl font-semibold hover:bg-[#8c6b32] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            @if (loading()) {
              <div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              {{ 'analyzing' | translate }}
            } @else {
              <mat-icon>psychology</mat-icon>
              {{ 'get_recommendation' | translate }}
            }
          </button>
        </div>
      </div>

      <!-- Results Display -->
      @if (result()) {
        <div class="space-y-6 animate-fade-in">
          <h3 class="text-xl font-bold text-[#6A5A4F] flex items-center gap-2">
            <mat-icon class="text-[#A47E3B]">recommend</mat-icon>
            {{ 'rec_crops' | translate }}
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (crop of result().recommendedCrops; track crop.name) {
              <div class="bg-white rounded-xl p-6 shadow-sm border border-stone-100 hover:border-[#A47E3B]/30 transition-all hover:shadow-md group">
                <div class="flex justify-between items-start mb-4">
                  <h4 class="text-lg font-bold text-[#6A5A4F] group-hover:text-[#A47E3B] transition-colors">{{ crop.name }}</h4>
                  <span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                    {{ crop.season }}
                  </span>
                </div>
                
                <div class="space-y-3 text-sm text-stone-600">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-stone-400 text-base">schedule</mat-icon>
                    <span>{{ 'duration' | translate }}: <span class="font-medium text-stone-800">{{ crop.duration }}</span></span>
                  </div>
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-stone-400 text-base">scale</mat-icon>
                    <span>{{ 'yield' | translate }}: <span class="font-medium text-stone-800">{{ crop.yield }}</span></span>
                  </div>
                  <p class="mt-3 text-stone-500 italic border-l-2 border-[#A47E3B]/20 pl-3">
                    "{{ crop.reason }}"
                  </p>
                </div>
              </div>
            }
          </div>

          <!-- Farming Tips -->
          @if (result().farmingTips?.length) {
            <div class="bg-[#FDFBF5] rounded-xl p-6 border border-[#A47E3B]/10">
              <h4 class="text-lg font-bold text-[#6A5A4F] mb-4 flex items-center gap-2">
                <mat-icon class="text-[#A47E3B]">lightbulb</mat-icon>
                {{ 'expert_tips' | translate }}
              </h4>
              <ul class="space-y-3">
                @for (tip of result().farmingTips; track tip) {
                  <li class="flex items-start gap-3 text-stone-700">
                    <mat-icon class="text-green-600 text-sm mt-1">check_circle</mat-icon>
                    <span>{{ tip }}</span>
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class CropAdvisorComponent implements OnInit {
  dataService = inject(DataService);

  location = signal('');
  landType = signal('');
  soilType = signal('');
  water = signal('');
  
  loading = signal(false);
  locationLoading = signal(false);
  result = signal<any>(null);

  ngOnInit() {
    this.fetchLocation();
  }

  fetchLocation() {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    this.locationLoading.set(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          // Use BigDataCloud free reverse geocoding API
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          const data = await response.json();
          
          // Construct a readable location string
          const parts = [
            data.locality,
            data.city,
            data.principalSubdivision,
            data.countryName
          ].filter(Boolean);
          
          // Remove duplicates and join
          const uniqueParts = [...new Set(parts)];
          this.location.set(uniqueParts.join(', '));
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          // Fallback to coordinates if API fails
          this.location.set(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        } finally {
          this.locationLoading.set(false);
        }
      },
      (error) => {
        console.warn('Geolocation denied or failed:', error);
        this.locationLoading.set(false);
        if (error.code === error.PERMISSION_DENIED) {
           // Silent fail on init, but maybe alert on manual click? 
           // For now, we just stop loading.
        }
      }
    );
  }

  isValid() {
    return this.location() && this.landType() && this.soilType() && this.water();
  }

  async analyze() {
    if (!this.isValid()) return;
    
    this.loading.set(true);
    try {
      const data = await this.dataService.getCropSuggestions(
        this.location(),
        this.landType(),
        this.soilType(),
        this.water()
      );
      this.result.set(data);
    } catch (e) {
      alert('Failed to get suggestions. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
