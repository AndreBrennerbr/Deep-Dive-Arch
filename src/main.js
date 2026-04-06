import { MOD_MATH } from './slices/math/data.js';
import { renderMath } from './slices/math/canvas.js';

import { MOD_DSA } from './slices/dsa/data.js';
import { renderDSA } from './slices/dsa/canvas.js';

import { MOD_CPU } from './slices/cpu/data.js';
import { renderCPU } from './slices/cpu/canvas.js';

import { MOD_OS } from './slices/os/data.js';
import { renderOS } from './slices/os/canvas.js';

import { MOD_CONC } from './slices/concurrency/data.js';
import { renderConcurrency } from './slices/concurrency/canvas.js';

import { MOD_COMP } from './slices/compilers/data.js';
import { renderCompilers } from './slices/compilers/canvas.js';

import { MOD_NETWORKS } from './slices/networks/data.js';
import { renderNetwork } from './slices/networks/canvas.js';

import { MOD_CRYPTO } from './slices/crypto/data.js';
import { renderCrypto } from './slices/crypto/canvas.js';

import { MOD_DB } from './slices/db/data.js';
import { renderDB } from './slices/db/canvas.js';

import { MOD_DIST } from './slices/distributed/data.js';
import { renderDistributed } from './slices/distributed/canvas.js';

import { MOD_AI } from './slices/ai/data.js';
import { renderAI } from './slices/ai/canvas.js';

const { createApp, ref, computed, watch, nextTick, onMounted } = Vue;

const App = {
  setup() {
    const isHome = ref(true);
    const activeTheme = ref('math');
    const stepIdx = ref(0);
    const canvasRef = ref(null);
    let currentEngine = null;
    const showModuleMenu = ref(false);

    const MODULES = {
      math: MOD_MATH,
      dsa: MOD_DSA,
      cpu: MOD_CPU,
      os: MOD_OS,
      conc: MOD_CONC,
      comp: MOD_COMP,
      net: MOD_NETWORKS,
      crypto: MOD_CRYPTO,
      db: MOD_DB,
      dist: MOD_DIST,
      ai: MOD_AI
    };

    const MODULE_ICONS = { math: '📐', dsa: '💾', cpu: '🖥️', os: '⚙️', conc: '🔄', comp: '🏗️', net: '🌐', crypto: '🔐', db: '🗄️', dist: '🌍', ai: '🧠' };
    const currentModuleIcon = computed(() => MODULE_ICONS[activeTheme.value]);
    const allModuleKeys = Object.keys(MODULES);
    const getModuleIcon = (key) => MODULE_ICONS[key];

    const currentModule = computed(() => MODULES[activeTheme.value]);
    const currentStepData = computed(() => {
      if (currentModule.value && currentModule.value.steps[stepIdx.value]) {
        return currentModule.value.steps[stepIdx.value];
      }
      return null;
    });

    const isFirstStep = computed(() => stepIdx.value === 0);
    const isLastStep = computed(() => {
       if(!currentModule.value) return false;
       return stepIdx.value === currentModule.value.steps.length - 1;
    });

    const goHome = () => {
      showModuleMenu.value = false;
      if(currentEngine && currentEngine.stop) currentEngine.stop();
      currentEngine = null;
      isHome.value = true;
    };

    const setTheme = (theme) => {
      showModuleMenu.value = false;
      isHome.value = false;
      if(activeTheme.value !== theme) {
         activeTheme.value = theme;
         stepIdx.value = 0;
      }
    };

    const setStep = (idx) => {
      stepIdx.value = idx;
    };

    const nextStep = () => {
      if (!isLastStep.value) stepIdx.value++;
    };

    const prevStep = () => {
       if (!isFirstStep.value) stepIdx.value--;
    };

    // Watchers para redesenhar
    watch([activeTheme, stepIdx], () => {
       if(!isHome.value) nextTick(bootstrapCanvas);
    });

    // Quando o canvas entra no DOM (após transition out-in), bootstrap
    watch(canvasRef, (cvs) => {
       if(cvs && !isHome.value) nextTick(bootstrapCanvas);
    });

    onMounted(() => {
       // Começa na home, sem canvas
    });

    const bootstrapCanvas = () => {
      const cvs = canvasRef.value;
      if (!cvs) return;
      
      // Cleanup previous engine loop
      if(currentEngine && currentEngine.stop) currentEngine.stop();
      
      if(activeTheme.value === 'math') currentEngine = renderMath(cvs);
      else if(activeTheme.value === 'dsa') currentEngine = renderDSA(cvs);
      else if(activeTheme.value === 'cpu') currentEngine = renderCPU(cvs);
      else if(activeTheme.value === 'os') currentEngine = renderOS(cvs);
      else if(activeTheme.value === 'conc') currentEngine = renderConcurrency(cvs);
      else if(activeTheme.value === 'comp') currentEngine = renderCompilers(cvs);
      else if(activeTheme.value === 'net') currentEngine = renderNetwork(cvs);
      else if(activeTheme.value === 'crypto') currentEngine = renderCrypto(cvs);
      else if(activeTheme.value === 'db') currentEngine = renderDB(cvs);
      else if(activeTheme.value === 'dist') currentEngine = renderDistributed(cvs);
      else if(activeTheme.value === 'ai') currentEngine = renderAI(cvs);

      if(currentEngine && currentEngine.drawStep) {
         currentEngine.drawStep(stepIdx.value);
      }
    };

    return {
      isHome,
      activeTheme,
      stepIdx,
      showModuleMenu,
      currentModule,
      currentModuleIcon,
      allModuleKeys,
      getModuleIcon,
      MODULES,
      currentStepData,
      isFirstStep,
      isLastStep,
      goHome,
      setTheme,
      setStep,
      nextStep,
      prevStep,
      canvasRef
    };
  }
};

createApp(App).mount('#app');
