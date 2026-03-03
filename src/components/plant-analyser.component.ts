import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleGenAI } from '@google/genai';
import { DataService } from '../services/data.service';
import { TranslationService } from '../services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { GEMINI_API_KEY } from '../config';

@Component({
  selector: 'app-plant-analyser',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="max-w-4xl mx-auto">
      <header class="mb-8 text-center">
        <div class="inline-block p-3 rounded-full bg-green-100 text-green-600 mb-4 text-3xl">🌿</div>
        <h2 class="text-3xl font-bold text-[#6A5A4F] mb-2">{{ 'ai_plant_diagnostician' | translate }}</h2>
        <p class="text-stone-600 max-w-lg mx-auto">{{ 'plant_analyser_desc' | translate }}</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- Upload Section -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
           <h3 class="font-bold text-stone-700 mb-4">{{ 'capture_or_upload' | translate }}</h3>
           
           <div class="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:bg-stone-50 transition-colors cursor-pointer relative group" (click)="fileInput.click()">
             <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
             
             @if (previewUrl()) {
               <img [src]="previewUrl()" class="max-h-64 mx-auto rounded-lg shadow-md object-contain">
               <button (click)="clearImage($event)" class="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 text-red-500">✕</button>
             } @else {
               <div class="text-stone-400 mb-2 text-4xl group-hover:scale-110 transition-transform">📸</div>
               <p class="font-bold text-stone-600">{{ 'click_to_upload' | translate }}</p>
               <p class="text-xs text-stone-400 mt-1">{{ 'supports_formats' | translate }}</p>
             }
           </div>

           <div class="mt-4 flex gap-2">
             <button (click)="fileInput.click()" class="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
               <span>📂</span> {{ 'upload_photo' | translate }}
             </button>
             <button class="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 opacity-50 cursor-not-allowed" title="Camera access requires HTTPS">
               <span>📷</span> {{ 'open_camera' | translate }}
             </button>
           </div>

           @if (previewUrl()) {
             <button 
               (click)="analyzeImage()" 
               [disabled]="isAnalyzing()"
               class="w-full mt-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2">
               @if (isAnalyzing()) {
                 <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 {{ 'diagnosing' | translate }}...
               } @else {
                 <span>🔍</span> {{ 'analyze_health' | translate }}
               }
             </button>
           }
        </div>

        <!-- Results Section -->
        <div class="space-y-6">
          
          <!-- Capabilities Info (Shown when no result) -->
          @if (!result()) {
            <div class="bg-stone-50 p-6 rounded-2xl border border-stone-200 h-full flex flex-col justify-center">
               <h4 class="font-bold text-stone-400 uppercase tracking-wider text-xs mb-4">{{ 'capabilities' | translate }}</h4>
               <ul class="space-y-4">
                 <li class="flex items-start gap-3">
                   <div class="bg-red-100 text-red-600 p-2 rounded-lg">🦠</div>
                   <div>
                     <div class="font-bold text-stone-700">{{ 'disease_detection' | translate }}</div>
                     <div class="text-xs text-stone-500">{{ 'cap_disease_desc' | translate }}</div>
                   </div>
                 </li>
                 <li class="flex items-start gap-3">
                   <div class="bg-yellow-100 text-yellow-600 p-2 rounded-lg">🍂</div>
                   <div>
                     <div class="font-bold text-stone-700">{{ 'nutrient_deficiency' | translate }}</div>
                     <div class="text-xs text-stone-500">{{ 'cap_deficiency_desc' | translate }}</div>
                   </div>
                 </li>
                 <li class="flex items-start gap-3">
                   <div class="bg-blue-100 text-blue-600 p-2 rounded-lg">🌱</div>
                   <div>
                     <div class="font-bold text-stone-700">{{ 'growth_stage' | translate }}</div>
                     <div class="text-xs text-stone-500">{{ 'cap_growth_desc' | translate }}</div>
                   </div>
                 </li>
               </ul>
            </div>
          }

          <!-- Analysis Result -->
          @if (result()) {
            <div class="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden animate-fadeIn">
              
              <!-- Header -->
              <div class="p-6 border-b border-stone-100 flex justify-between items-start bg-gradient-to-r"
                   [class.from-green-50]="result()?.health === 'Healthy'"
                   [class.to-green-100]="result()?.health === 'Healthy'"
                   [class.from-red-50]="result()?.health !== 'Healthy'"
                   [class.to-red-100]="result()?.health !== 'Healthy'">
                <div>
                  <div class="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">{{ 'analysis_result' | translate }}</div>
                  <h3 class="text-2xl font-bold text-stone-800">{{ result()?.name }}</h3>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="px-3 py-1 rounded-full text-sm font-bold border"
                          [class.bg-green-100]="result()?.health === 'Healthy'"
                          [class.text-green-700]="result()?.health === 'Healthy'"
                          [class.border-green-200]="result()?.health === 'Healthy'"
                          [class.bg-red-100]="result()?.health !== 'Healthy'"
                          [class.text-red-700]="result()?.health !== 'Healthy'"
                          [class.border-red-200]="result()?.health !== 'Healthy'">
                      {{ result()?.health === 'Healthy' ? ('healthy' | translate) : ('attention' | translate) }}
                    </span>
                    <span class="text-xs text-stone-500 font-mono">{{ 'ai_confidence' | translate }}: {{ result()?.confidence }}%</span>
                  </div>
                </div>
                <div class="text-4xl">
                  {{ result()?.health === 'Healthy' ? '✅' : '⚠️' }}
                </div>
              </div>

              <!-- Content -->
              <div class="p-6 space-y-6">
                
                <!-- Issues -->
                <div>
                  <h4 class="font-bold text-stone-700 mb-2 flex items-center gap-2">
                    <span>🔍</span> {{ 'symptoms' | translate }}
                  </h4>
                  <p class="text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                    {{ result()?.symptoms || ('none_detected' | translate) }}
                  </p>
                </div>

                <!-- Nutrient Deficiency Alert (Special Integration) -->
                @if (result()?.deficiency) {
                  <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <div class="text-2xl">🧪</div>
                    <div>
                      <h5 class="font-bold text-amber-800">{{ 'nutrient_deficiency_detected' | translate }}: {{ result()?.deficiency }}</h5>
                      <p class="text-sm text-amber-700 mt-1">{{ 'create_mix_msg' | translate }}</p>
                      <button (click)="goToCalculator()" class="mt-2 text-xs font-bold bg-amber-200 text-amber-800 px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">
                        {{ 'go_to_calculator' | translate }} →
                      </button>
                    </div>
                  </div>
                }

                <!-- Treatment -->
                @if (result()?.treatment) {
                  <div>
                    <h4 class="font-bold text-stone-700 mb-2 flex items-center gap-2">
                      <span>💊</span> {{ 'recommended_treatment' | translate }}
                    </h4>
                    
                    <div class="space-y-3">
                      <div class="bg-green-50 p-3 rounded-lg border border-green-100">
                        <div class="text-xs font-bold text-green-700 uppercase mb-1">{{ 'organic_solutions' | translate }}</div>
                        <p class="text-stone-700 text-sm">{{ result()?.treatment?.organic }}</p>
                      </div>
                      
                      <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div class="text-xs font-bold text-blue-700 uppercase mb-1">{{ 'chemical_intervention' | translate }}</div>
                        <p class="text-stone-700 text-sm">{{ result()?.treatment?.chemical }}</p>
                      </div>
                    </div>
                  </div>
                }

                <!-- Prevention -->
                @if (result()?.prevention) {
                  <div>
                    <h4 class="font-bold text-stone-700 mb-2 flex items-center gap-2">
                      <span>🛡️</span> {{ 'preventive_measures' | translate }}
                    </h4>
                    <ul class="list-disc list-inside text-stone-600 text-sm space-y-1 ml-1">
                      @for (step of result()?.prevention; track step) {
                        <li>{{ step }}</li>
                      }
                    </ul>
                  </div>
                }

              </div>
              
              <div class="bg-stone-50 p-4 border-t border-stone-100 text-center">
                <button (click)="reset()" class="text-stone-500 hover:text-stone-800 font-bold text-sm transition-colors">
                  {{ 'analyze_another' | translate }}
                </button>
              </div>

            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class PlantAnalyserComponent {
  dataService = inject(DataService);
  translationService = inject(TranslationService);
  
  previewUrl = signal<string | null>(null);
  isAnalyzing = signal<boolean>(false);
  result = signal<any>(null);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
        this.result.set(null); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage(e: Event) {
    e.stopPropagation();
    this.previewUrl.set(null);
    this.result.set(null);
  }

  reset() {
    this.previewUrl.set(null);
    this.result.set(null);
  }

  goToCalculator() {
    this.dataService.currentTab.set('ratio');
  }

  async analyzeImage() {
    if (!this.previewUrl()) return;
    
    this.isAnalyzing.set(true);

    try {
      // Initialize Gemini
      const apiKey = GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key missing');

      const ai = new GoogleGenAI({ apiKey });
      
      // Prepare Image
      const mimeType = this.previewUrl()!.split(';')[0].split(':')[1];
      const base64Data = this.previewUrl()!.split(',')[1];
      
      const prompt = `
        Analyze this plant image for diseases, pests, or nutrient deficiencies.
        Return the response in ${this.translationService.currentLang()} language.
        Return a JSON object with this EXACT structure:
        {
          "name": "Plant Name",
          "health": "Healthy" or "Unhealthy",
          "confidence": 95,
          "symptoms": "Description of visual symptoms...",
          "deficiency": "Nitrogen" or "Phosphorus" or "Potassium" or null,
          "treatment": {
            "organic": "Organic remedy...",
            "chemical": "Chemical remedy..."
          },
          "prevention": ["Step 1", "Step 2"]
        }
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mimeType, data: base64Data } }
          ]
        }
      });

      const responseText = result.text;
      if (!responseText) throw new Error('No response from AI');
      
      // Clean and parse JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        this.result.set(analysis);

        // If deficiency detected, update global state for Ratio Calculator
        if (analysis.deficiency) {
          this.dataService.addDeficiency(analysis.deficiency);
        }
      }

    } catch (error) {
      console.error('Analysis failed', error);
      alert(this.translationService.translate('analysis_failed'));
    } finally {
      this.isAnalyzing.set(false);
    }
  }
}
