import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-weather-forecast',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  template: `
    <div class="space-y-8 max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-3xl font-bold text-[#6A5A4F] tracking-tight">{{ 'weather_title' | translate }}</h2>
          <p class="text-stone-500 mt-1">{{ 'weather_subtitle' | translate }}</p>
        </div>
        <button (click)="refreshWeather()" class="flex items-center gap-2 px-5 py-2.5 bg-[#A47E3B] text-white rounded-xl hover:bg-[#8c6b32] transition-all shadow-sm hover:shadow-md active:scale-95">
          <mat-icon class="scale-90">refresh</mat-icon>
          <span class="font-medium">{{ 'refresh' | translate }}</span>
        </button>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-stone-100">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-stone-100 border-t-[#A47E3B]"></div>
          <p class="mt-4 text-stone-500 font-medium">{{ 'fetching_weather' | translate }}</p>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 flex items-center gap-4 shadow-sm">
          <div class="p-2 bg-red-100 rounded-full">
            <mat-icon>error_outline</mat-icon>
          </div>
          <div>
            <h3 class="font-bold text-red-800">{{ 'error' | translate }}</h3>
            <p class="text-sm text-red-600">{{ 'fetch_failed' | translate }}</p>
          </div>
        </div>
      }

      <!-- Weather Content -->
      @if (weatherData() && !loading()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Current Weather Card -->
          <div class="lg:col-span-1 bg-gradient-to-br from-[#6A5A4F] to-[#4F4A45] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden group">
            <!-- Decorative Background Elements -->
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
            <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>

            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div>
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-4">
                    <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span class="text-xs font-bold uppercase tracking-wider text-white/90">{{ 'current_weather' | translate }}</span>
                  </div>
                  <h3 class="text-6xl font-bold tracking-tighter">{{ weatherData().current.temperature_2m }}°</h3>
                  <p class="text-lg text-white/80 mt-2 font-medium">{{ getWeatherDescription(weatherData().current.weather_code) | translate }}</p>
                </div>
                <mat-icon class="text-8xl text-yellow-400 drop-shadow-lg">{{ getWeatherIcon(weatherData().current.weather_code) }}</mat-icon>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/5 hover:bg-white/15 transition-colors">
                  <div class="flex items-center gap-2 text-white/70 text-xs font-medium uppercase tracking-wide mb-2">
                    <mat-icon class="text-sm">water_drop</mat-icon> {{ 'humidity' | translate }}
                  </div>
                  <p class="text-2xl font-bold">{{ weatherData().current.relative_humidity_2m }}%</p>
                </div>
                <div class="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/5 hover:bg-white/15 transition-colors">
                  <div class="flex items-center gap-2 text-white/70 text-xs font-medium uppercase tracking-wide mb-2">
                    <mat-icon class="text-sm">air</mat-icon> {{ 'wind' | translate }}
                  </div>
                  <p class="text-2xl font-bold">{{ weatherData().current.wind_speed_10m }} <span class="text-sm font-normal text-white/60">km/h</span></p>
                </div>
              </div>
            </div>
          </div>

          <!-- 5-Day Forecast -->
          <div class="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-[#6A5A4F] flex items-center gap-2">
                <mat-icon class="text-[#A47E3B]">calendar_today</mat-icon>
                {{ 'forecast_title' | translate }}
              </h3>
              <span class="text-xs font-medium text-stone-400 uppercase tracking-wider">Next 5 Days</span>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              @for (day of shortTermForecast(); track day.date) {
                <div class="flex flex-col items-center p-4 rounded-2xl bg-stone-50 hover:bg-[#A47E3B]/5 transition-all duration-300 border border-stone-100 hover:border-[#A47E3B]/20 group cursor-default">
                  <p class="text-sm font-bold text-stone-600 mb-3 group-hover:text-[#A47E3B] transition-colors">{{ day.dayName }}</p>
                  <mat-icon class="text-4xl text-stone-400 mb-3 group-hover:text-[#A47E3B] group-hover:scale-110 transition-all duration-300">{{ getWeatherIcon(day.code) }}</mat-icon>
                  <div class="flex items-center gap-2 mt-auto">
                    <span class="font-bold text-stone-800 text-lg">{{ day.maxTemp }}°</span>
                    <span class="text-stone-400 text-sm font-medium">{{ day.minTemp }}°</span>
                  </div>
                  <p class="text-[10px] text-stone-400 mt-2 text-center leading-tight font-medium uppercase tracking-wide">{{ getWeatherDescription(day.code) | translate }}</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Monthly Forecast (Extended 16-Day) -->
        <div class="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 overflow-hidden">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-[#6A5A4F] flex items-center gap-2">
              <mat-icon class="text-[#A47E3B]">date_range</mat-icon>
              {{ 'extended_forecast' | translate }}
            </h3>
            <span class="text-xs font-medium text-stone-400 uppercase tracking-wider">16-Day Outlook</span>
          </div>

          <div class="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <div class="flex gap-4 min-w-max">
              @for (day of extendedForecast(); track day.date) {
                <div class="flex flex-col w-32 p-4 rounded-2xl border border-stone-100 hover:shadow-md hover:border-[#A47E3B]/20 transition-all bg-white group">
                  <div class="text-center mb-3">
                    <p class="text-xs font-bold text-stone-500 uppercase tracking-wider">{{ day.month }}</p>
                    <p class="text-lg font-bold text-stone-800">{{ day.dayNum }}</p>
                    <p class="text-xs text-stone-400">{{ day.dayName }}</p>
                  </div>
                  
                  <div class="flex justify-center mb-3">
                    <mat-icon class="text-3xl text-stone-400 group-hover:text-[#A47E3B] transition-colors">{{ getWeatherIcon(day.code) }}</mat-icon>
                  </div>
                  
                  <div class="mt-auto text-center">
                    <div class="flex justify-center items-center gap-2 mb-1">
                      <span class="font-bold text-stone-700">{{ day.maxTemp }}°</span>
                      <span class="w-px h-3 bg-stone-200"></span>
                      <span class="text-stone-400 text-sm">{{ day.minTemp }}°</span>
                    </div>
                    <p class="text-[10px] text-stone-400 truncate px-1" [title]="getWeatherDescription(day.code) | translate">
                      {{ getWeatherDescription(day.code) | translate }}
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class WeatherForecastComponent implements OnInit {
  dataService = inject(DataService);
  
  weatherData = signal<any>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  shortTermForecast = signal<any[]>([]);
  extendedForecast = signal<any[]>([]);

  ngOnInit() {
    this.refreshWeather();
  }

  refreshWeather() {
    this.loading.set(true);
    this.error.set(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await this.dataService.getWeather(
              position.coords.latitude,
              position.coords.longitude
            );
            this.processWeatherData(data);
          } catch (err) {
            this.error.set('Failed to fetch weather data.');
          } finally {
            this.loading.set(false);
          }
        },
        (err) => {
          console.warn('Geolocation denied, using default location (Coimbatore)');
          this.fetchDefaultWeather();
        }
      );
    } else {
      this.fetchDefaultWeather();
    }
  }

  async fetchDefaultWeather() {
    try {
      // Coimbatore coordinates
      const data = await this.dataService.getWeather(11.0168, 76.9558);
      this.processWeatherData(data);
    } catch (err) {
      this.error.set('Failed to fetch weather data.');
    } finally {
      this.loading.set(false);
    }
  }

  processWeatherData(data: any) {
    this.weatherData.set(data);
    
    const daily = data.daily;
    const allDays = [];
    
    // Process all available days (up to 16)
    const count = daily.time.length;
    
    for (let i = 0; i < count; i++) {
      const date = new Date(daily.time[i]);
      allDays.push({
        date: daily.time[i],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        code: daily.weather_code[i],
        maxTemp: Math.round(daily.temperature_2m_max[i]),
        minTemp: Math.round(daily.temperature_2m_min[i])
      });
    }
    
    // First 5 days for short term
    this.shortTermForecast.set(allDays.slice(0, 5));
    
    // Remaining days for extended forecast (skip today/tomorrow if redundant, but user asked for monthly below 5 day)
    // Let's show all 16 days in the extended view, or just the remaining ones.
    // Usually "Extended" implies the future beyond the short term.
    // Let's show from day 6 onwards to avoid duplication, or maybe day 1 onwards if they want a full calendar view.
    // The user said "monthly forecasting below the 5 day forecast".
    // I'll show the full set in the extended view for completeness, or maybe start from day 5.
    // Let's start from day 0 to show the full trend, or day 5.
    // I'll show all days in the extended view but maybe styled differently.
    // Actually, showing days 6-16 makes more sense as "Extended".
    
    if (allDays.length > 5) {
      this.extendedForecast.set(allDays.slice(5));
    } else {
      this.extendedForecast.set([]);
    }
  }

  getWeatherDescription(code: number): string {
    const codes: Record<number, string> = {
      0: 'clear_sky',
      1: 'mainly_clear',
      2: 'partly_cloudy',
      3: 'overcast',
      45: 'fog',
      48: 'fog',
      51: 'drizzle',
      53: 'drizzle',
      55: 'drizzle',
      61: 'rain',
      63: 'rain',
      65: 'rain',
      71: 'snow',
      73: 'snow',
      75: 'snow',
      77: 'snow',
      80: 'rain',
      81: 'rain',
      82: 'rain',
      85: 'snow',
      86: 'snow',
      95: 'thunderstorm',
      96: 'thunderstorm',
      99: 'thunderstorm'
    };
    return codes[code] || 'weather_title';
  }

  getWeatherIcon(code: number): string {
    if (code === 0) return 'wb_sunny';
    if (code >= 1 && code <= 3) return 'partly_cloudy_day';
    if (code >= 45 && code <= 48) return 'foggy';
    if (code >= 51 && code <= 67) return 'rainy';
    if (code >= 71 && code <= 77) return 'ac_unit';
    if (code >= 80 && code <= 82) return 'water_drop';
    if (code >= 95) return 'thunderstorm';
    return 'cloud';
  }
}
