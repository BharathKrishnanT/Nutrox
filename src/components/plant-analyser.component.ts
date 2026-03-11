import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleGenAI } from '@google/genai';
import { DataService } from '../services/data.service';
import { TranslationService } from '../services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { GEMINI_API_KEY } from '../config';

export interface AnalysisHistory {
  id: string;
  date: number;
  image: string;
  result: any;
}

@Component({
  selector: 'app-plant-analyser',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="max-w-5xl mx-auto">
      <header class="mb-10 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-lg shadow-green-200 mb-6 text-3xl transform -rotate-6 hover:rotate-0 transition-transform duration-300">🌿</div>
        <h2 class="text-4xl font-extrabold text-stone-800 mb-3 tracking-tight">{{ 'ai_plant_diagnostician' | translate }}</h2>
        <p class="text-stone-500 max-w-xl mx-auto text-lg">{{ 'plant_analyser_desc' | translate }}</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Upload Section -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-stone-200/60">
             <div class="flex items-center justify-between mb-4">
               <h3 class="font-bold text-stone-800 text-lg">{{ 'capture_or_upload' | translate }}</h3>
               <span class="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">Step 1</span>
             </div>
             
             <div class="border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-2xl p-8 text-center hover:bg-emerald-50/80 transition-all duration-300 cursor-pointer relative group" (click)="fileInput.click()">
               <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
               
               @if (previewUrl()) {
                 <img [src]="previewUrl()" class="max-h-64 w-full object-cover rounded-xl shadow-sm">
                 <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <span class="text-white font-bold bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">Change Image</span>
                 </div>
                 <button (click)="clearImage($event)" class="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 text-red-500 border border-stone-100 transition-transform hover:scale-110">✕</button>
               } @else {
                 <div class="w-20 h-20 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center text-4xl mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 text-emerald-500">📸</div>
                 <p class="font-bold text-stone-700 text-lg">{{ 'click_to_upload' | translate }}</p>
                 <p class="text-sm text-stone-400 mt-2">{{ 'supports_formats' | translate }}</p>
               }
             </div>

             <div class="mt-4 flex gap-3">
               <button (click)="fileInput.click()" class="flex-1 bg-white border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 text-stone-700 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm">
                 <span class="text-xl">📂</span> {{ 'upload_photo' | translate }}
               </button>
               <button class="flex-1 bg-white border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 text-stone-700 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm opacity-50 cursor-not-allowed" title="Camera access requires HTTPS">
                 <span class="text-xl">📷</span> {{ 'open_camera' | translate }}
               </button>
             </div>

             @if (previewUrl()) {
               <button 
                 (click)="analyzeImage()" 
                 [disabled]="isAnalyzing()"
                 class="w-full mt-6 bg-stone-900 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-wait disabled:transform-none flex items-center justify-center gap-3 text-lg">
                 @if (isAnalyzing()) {
                   <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   {{ 'diagnosing' | translate }}...
                 } @else {
                   <span class="text-emerald-400">✨</span> {{ 'analyze_health' | translate }}
                 }
               </button>
             }
          </div>
        </div>

        <!-- Results Section -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- Capabilities Info (Shown when no result) -->
          @if (!result() && !isAnalyzing()) {
            <div class="bg-stone-50/50 p-8 rounded-3xl border border-stone-200/60 h-full flex flex-col justify-center">
               <div class="text-center mb-8">
                 <div class="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl mb-4">🤖</div>
                 <h4 class="font-bold text-stone-800 text-xl">{{ 'capabilities' | translate }}</h4>
                 <p class="text-stone-500 text-sm mt-2">Our advanced vision model can detect multiple issues from a single photo.</p>
               </div>
               
               <div class="grid gap-4">
                 <div class="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-start gap-4 hover:border-red-200 transition-colors">
                   <div class="bg-red-50 text-red-500 p-3 rounded-xl text-xl">🦠</div>
                   <div>
                     <div class="font-bold text-stone-800">{{ 'disease_detection' | translate }}</div>
                     <div class="text-sm text-stone-500 mt-1">{{ 'cap_disease_desc' | translate }}</div>
                   </div>
                 </div>
                 <div class="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-start gap-4 hover:border-amber-200 transition-colors">
                   <div class="bg-amber-50 text-amber-500 p-3 rounded-xl text-xl">🍂</div>
                   <div>
                     <div class="font-bold text-stone-800">{{ 'nutrient_deficiency' | translate }}</div>
                     <div class="text-sm text-stone-500 mt-1">{{ 'cap_deficiency_desc' | translate }}</div>
                   </div>
                 </div>
               </div>
            </div>
          }

          <!-- Loading State -->
          @if (isAnalyzing()) {
            <div class="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm h-full flex flex-col items-center justify-center text-center animate-pulse">
              <div class="w-20 h-20 relative mb-6">
                <div class="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                <div class="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
              </div>
              <h3 class="text-xl font-bold text-stone-800 mb-2">Analyzing Plant Data...</h3>
              <p class="text-stone-500">Scanning for diseases, pests, and nutrient levels</p>
            </div>
          }

          <!-- Analysis Result -->
          @if (result() && !isAnalyzing()) {
            <div class="bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200/60 overflow-hidden animate-fadeIn">
              
              <!-- Header -->
              <div class="p-8 border-b border-stone-100 flex justify-between items-start relative overflow-hidden"
                   [class.bg-emerald-50]="result()?.health === 'Healthy'"
                   [class.bg-red-50]="result()?.health !== 'Healthy'">
                
                <!-- Background decoration -->
                <div class="absolute -right-10 -top-10 text-9xl opacity-5 pointer-events-none">
                  {{ result()?.health === 'Healthy' ? '🌿' : '🦠' }}
                </div>

                <div class="relative z-10">
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/60 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-stone-600 mb-3 border border-white/40 shadow-sm">
                    <span class="w-2 h-2 rounded-full" [class.bg-emerald-500]="result()?.health === 'Healthy'" [class.bg-red-500]="result()?.health !== 'Healthy'"></span>
                    {{ 'analysis_result' | translate }}
                  </div>
                  <h3 class="text-3xl font-extrabold text-stone-800 tracking-tight">{{ result()?.name }}</h3>
                  <div class="flex items-center gap-3 mt-4">
                    <span class="px-4 py-1.5 rounded-full text-sm font-bold shadow-sm"
                          [class.bg-emerald-500]="result()?.health === 'Healthy'"
                          [class.text-white]="result()?.health === 'Healthy'"
                          [class.bg-red-500]="result()?.health !== 'Healthy'"
                          [class.text-white]="result()?.health !== 'Healthy'">
                      {{ result()?.health === 'Healthy' ? ('healthy' | translate) : ('attention' | translate) }}
                    </span>
                    <span class="text-sm text-stone-600 font-medium bg-white/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/40">
                      Confidence: <span class="font-mono font-bold">{{ result()?.confidence }}%</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div class="p-8 space-y-8">
                
                <!-- Symptoms -->
                <div>
                  <h4 class="font-bold text-stone-800 text-lg mb-3 flex items-center gap-2">
                    <span class="bg-stone-100 p-1.5 rounded-lg text-sm">🔍</span> {{ 'symptoms' | translate }}
                  </h4>
                  <p class="text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    {{ result()?.symptoms || ('none_detected' | translate) }}
                  </p>
                </div>

                <!-- Nutrient Deficiency Alert -->
                @if (result()?.deficiency) {
                  <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                    <div class="bg-white p-2 rounded-xl shadow-sm text-xl">🧪</div>
                    <div>
                      <h5 class="font-bold text-amber-900 text-lg">{{ 'nutrient_deficiency_detected' | translate }}: {{ result()?.deficiency }}</h5>
                      <p class="text-sm text-amber-700 mt-1 mb-3">{{ 'create_mix_msg' | translate }}</p>
                      <button (click)="goToCalculator()" class="text-sm font-bold bg-amber-500 text-white px-4 py-2 rounded-xl shadow-md shadow-amber-200 hover:bg-amber-600 hover:-translate-y-0.5 transition-all">
                        {{ 'go_to_calculator' | translate }} →
                      </button>
                    </div>
                  </div>
                }

                <!-- Treatment -->
                @if (result()?.treatment) {
                  <div>
                    <h4 class="font-bold text-stone-800 text-lg mb-4 flex items-center gap-2">
                      <span class="bg-stone-100 p-1.5 rounded-lg text-sm">💊</span> {{ 'recommended_treatment' | translate }}
                    </h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                        <div class="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <span class="bg-emerald-100 p-1 rounded">🌿</span> {{ 'organic_solutions' | translate }}
                        </div>
                        <p class="text-stone-700 text-sm leading-relaxed whitespace-pre-line">{{ result()?.treatment?.organic }}</p>
                      </div>
                      
                      <div class="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex flex-col">
                        <div class="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <span class="bg-blue-100 p-1 rounded">🧪</span> {{ 'chemical_intervention' | translate }}
                        </div>
                        <p class="text-stone-700 text-sm leading-relaxed flex-grow whitespace-pre-line">{{ result()?.treatment?.chemical }}</p>
                        
                        <!-- Pesticide Links -->
                        @if (result()?.treatment?.pesticideName) {
                          <div class="mt-4 pt-4 border-t border-blue-200/50">
                            <div class="text-xs font-bold text-stone-500 mb-2">Buy {{ result()?.treatment?.pesticideName }} online:</div>
                            <div class="flex gap-2">
                              <a [href]="'https://www.amazon.in/s?k=' + result()?.treatment?.pesticideName" target="_blank" class="flex-1 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold py-2.5 px-3 rounded-xl border border-stone-200 shadow-sm transition-colors flex items-center justify-center gap-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" class="h-3 opacity-80" alt="Amazon">
                              </a>
                              <a [href]="'https://www.flipkart.com/search?q=' + result()?.treatment?.pesticideName" target="_blank" class="flex-1 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold py-2.5 px-3 rounded-xl border border-stone-200 shadow-sm transition-colors flex items-center justify-center gap-2">
                                <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg" class="h-4 opacity-80" alt="Flipkart">
                              </a>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }

                <!-- Prevention -->
                @if (result()?.prevention) {
                  <div>
                    <h4 class="font-bold text-stone-800 text-lg mb-3 flex items-center gap-2">
                      <span class="bg-stone-100 p-1.5 rounded-lg text-sm">🛡️</span> {{ 'preventive_measures' | translate }}
                    </h4>
                    <ul class="space-y-2">
                      @for (step of result()?.prevention; track step) {
                        <li class="flex items-start gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                          <div class="text-emerald-500 mt-0.5">✓</div>
                          <div class="text-stone-600 text-sm">{{ step }}</div>
                        </li>
                      }
                    </ul>
                  </div>
                }

              </div>
              
            </div>
          }
        </div>

      </div>

      <!-- History Section -->
      @if (history().length > 0) {
        <div class="mt-16 pt-10 border-t border-stone-200/60">
          <div class="flex justify-between items-center mb-8">
            <div>
              <h3 class="text-2xl font-bold text-stone-800 flex items-center gap-3">
                <span class="bg-stone-100 p-2 rounded-xl text-xl">🕒</span> Analysis History
              </h3>
              <p class="text-stone-500 text-sm mt-1">Your recent plant health scans saved locally.</p>
            </div>
            <button (click)="clearHistory()" class="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors border border-red-100">
              Clear History
            </button>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
            @for (item of history(); track item.id) {
              <div class="bg-white rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col" (click)="loadFromHistory(item)">
                <div class="h-32 overflow-hidden relative">
                  <img [src]="item.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                  <div class="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent"></div>
                  <div class="absolute bottom-3 left-3 right-3">
                    <div class="text-white font-bold text-sm truncate drop-shadow-md">{{ item.result.name }}</div>
                    <div class="text-white/80 text-xs mt-0.5">{{ item.date | date:'mediumDate' }}</div>
                  </div>
                </div>
                <div class="p-3 bg-white flex justify-between items-center flex-grow">
                  <span class="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider"
                        [class.bg-emerald-100]="item.result.health === 'Healthy'"
                        [class.text-emerald-700]="item.result.health === 'Healthy'"
                        [class.bg-red-100]="item.result.health !== 'Healthy'"
                        [class.text-red-700]="item.result.health !== 'Healthy'">
                    {{ item.result.health }}
                  </span>
                  <span class="text-xs text-stone-400 font-mono font-medium">{{ item.result.confidence }}%</span>
                </div>
              </div>
            }
          </div>
        </div>
      }

    </div>
  `
})
export class PlantAnalyserComponent implements OnInit {
  dataService = inject(DataService);
  translationService = inject(TranslationService);
  
  previewUrl = signal<string | null>(null);
  isAnalyzing = signal<boolean>(false);
  result = signal<any>(null);
  history = signal<AnalysisHistory[]>([]);

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    const saved = localStorage.getItem('plant_analysis_history');
    if (saved) {
      try {
        this.history.set(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }

  saveToHistory(image: string, result: any) {
    const newItem: AnalysisHistory = {
      id: Date.now().toString(),
      date: Date.now(),
      image,
      result
    };
    const current = this.history();
    // Keep last 10 items
    const updated = [newItem, ...current].slice(0, 10);
    this.history.set(updated);
    localStorage.setItem('plant_analysis_history', JSON.stringify(updated));
  }

  clearHistory() {
    if (confirm('Are you sure you want to clear your local analysis history?')) {
      this.history.set([]);
      localStorage.removeItem('plant_analysis_history');
    }
  }

  loadFromHistory(item: AnalysisHistory) {
    this.previewUrl.set(item.image);
    this.result.set(item.result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * MAX_WIDTH / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * MAX_HEIGHT / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG to drastically reduce payload size and speed up AI analysis
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          this.previewUrl.set(compressedDataUrl);
          this.result.set(null); // Reset previous result
        };
        img.src = e.target?.result as string;
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
        You are an expert agricultural pathologist and agronomist. Analyze this plant image for diseases, pests, or nutrient deficiencies with high precision.
        Return the response in ${this.translationService.currentLang()} language.
        
        CRITICAL INSTRUCTIONS FOR TREATMENTS:
        Because agricultural treatments are sensitive, your chemical and organic recommendations MUST be highly precise, accurate, and safe.
        - Include exact active ingredients and concentrations.
        - Provide precise dosages (e.g., "Mix 2ml per 1 Liter of water").
        - Specify application methods and timing (e.g., "Foliar spray during early morning").
        - Include critical safety precautions (e.g., "Toxic to bees", "Wear protective gear", "Pre-harvest interval").
        
        Return a JSON object with this EXACT structure:
        {
          "name": "Plant Name & Specific Disease/Pest",
          "health": "Healthy" or "Unhealthy",
          "confidence": 95,
          "symptoms": "Detailed description of visual symptoms...",
          "deficiency": "Nitrogen" or "Phosphorus" or "Potassium" or null,
          "treatment": {
            "organic": "Precise organic remedy including exact measurements, preparation, and application instructions...",
            "chemical": "Precise chemical remedy including active ingredient, exact dosage (ml/L), application method, and safety warnings...",
            "pesticideName": "Specific active ingredient or common commercial pesticide name to buy (e.g., 'Imidacloprid 17.8% SL', 'Neem Oil 10000 ppm'), else null"
          },
          "prevention": ["Specific step 1", "Specific step 2"]
        }
      `;

      let result;
      try {
        result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                { inlineData: { mimeType: mimeType, data: base64Data } }
              ]
            }
          ],
          config: {
            responseMimeType: 'application/json'
          }
        });
      } catch (e: any) {
        console.warn('Primary model failed, attempting fallback...', e);
        result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                { inlineData: { mimeType: mimeType, data: base64Data } }
              ]
            }
          ],
          config: {
            responseMimeType: 'application/json'
          }
        });
      }

      const responseText = result.text;
      if (!responseText) throw new Error('No response from AI');
      
      // Clean and parse JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        this.result.set(analysis);
        
        // Save to local history
        this.saveToHistory(this.previewUrl()!, analysis);

        // If deficiency detected, update global state for Ratio Calculator
        if (analysis.deficiency) {
          this.dataService.addDeficiency(analysis.deficiency);
        }
      } else {
         throw new Error('Invalid JSON response');
      }

    } catch (error: any) {
      console.error('Analysis failed', error);
      let errorMsg = error.message || String(error);
      
      if (errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('high demand')) {
        errorMsg = "Google's AI servers are currently experiencing high demand. Please wait a few seconds and try again.";
      } else if (errorMsg.includes('API key expired') || errorMsg.includes('API_KEY_INVALID')) {
        errorMsg = "Your API key is invalid or expired. Please update it in your environment variables.";
      }
      
      alert(`Analysis failed:\n\n${errorMsg}`);
    } finally {
      this.isAnalyzing.set(false);
    }
  }
}
