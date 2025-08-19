<template>
  <div class="progress-container">
    <div class="progress-header d-flex justify-content-between align-items-center mb-2">
      <span class="progress-label">{{ label || 'Progress' }}</span>
      <span class="progress-text">{{ current }} / {{ total }} {{ unit || 'steps' }}</span>
    </div>
    <div class="progress" :style="{ height: height + 'px' }">
      <div 
        class="progress-bar progress-bar-striped progress-bar-animated" 
        :class="progressBarClass"
        role="progressbar" 
        :style="{ width: progressPercentage + '%' }" 
        :aria-valuenow="current" 
        :aria-valuemin="0" 
        :aria-valuemax="total"
      >
        <span v-if="showPercentage" class="progress-percentage">{{ Math.round(progressPercentage) }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'ProgressBar',
  props: {
    current: {
      type: Number,
      required: true,
      validator: (value) => value >= 0
    },
    total: {
      type: Number,
      required: true,
      validator: (value) => value > 0
    },
    label: {
      type: String,
      default: ''
    },
    unit: {
      type: String,
      default: 'steps'
    },
    height: {
      type: Number,
      default: 25
    },
    showPercentage: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].includes(value)
    },
    animated: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const progressPercentage = computed(() => {
      if (props.total === 0) return 0;
      return Math.min(100, Math.max(0, (props.current / props.total) * 100));
    });
    
    const progressBarClass = computed(() => {
      let classes = [`bg-${props.variant}`];
      if (!props.animated) {
        classes = classes.filter(c => !c.includes('animated'));
      }
      return classes.join(' ');
    });
    
    return {
      progressPercentage,
      progressBarClass
    };
  }
};
</script>

<style scoped>
.progress-container {
  width: 100%;
}

.progress-header {
  font-size: 0.875rem;
}

.progress-label {
  font-weight: 600;
  color: #495057;
}

.progress-text {
  color: #6c757d;
  font-size: 0.8rem;
}

.progress {
  border-radius: 10px;
  background-color: #e9ecef;
  overflow: hidden;
}

.progress-bar {
  transition: width 0.6s ease;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.progress-percentage {
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

/* Custom animation for cooking mode */
@keyframes progress-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.progress-bar-animated.bg-primary {
  animation: progress-pulse 2s ease-in-out infinite;
}

/* Responsive design */
@media (max-width: 576px) {
  .progress-text {
    font-size: 0.7rem;
  }
  
  .progress-label {
    font-size: 0.8rem;
  }
}</style>