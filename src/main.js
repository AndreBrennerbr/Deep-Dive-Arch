import { MOD_NETWORKS } from './slices/networks/data.js';
import { renderNetwork } from './slices/networks/canvas.js';

import { MOD_NODEJS } from './slices/nodejs/data.js';
import { renderNode } from './slices/nodejs/canvas.js';

import { MOD_AI } from './slices/ai/data.js';
import { renderAI } from './slices/ai/canvas.js';

const { createApp, ref, computed, watch, nextTick, onMounted } = Vue;

const App = {
  setup() {
    const isHome = ref(true);
    const activeTheme = ref('net');
    const stepIdx = ref(0);
    const canvasRef = ref(null);
    let currentEngine = null;

    const MODULES = {
      net: MOD_NETWORKS,
      node: MOD_NODEJS,
      ai: MOD_AI
    };

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
      if(currentEngine && currentEngine.stop) currentEngine.stop();
      currentEngine = null;
      isHome.value = true;
    };

    const setTheme = (theme) => {
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
      
      if(activeTheme.value === 'net') currentEngine = renderNetwork(cvs);
      else if(activeTheme.value === 'node') currentEngine = renderNode(cvs);
      else if(activeTheme.value === 'ai') currentEngine = renderAI(cvs);

      if(currentEngine && currentEngine.drawStep) {
         currentEngine.drawStep(stepIdx.value);
      }
    };

    return {
      isHome,
      activeTheme,
      stepIdx,
      currentModule,
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
