<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link :to="{ name: 'main' }" class="navbar-brand">
          <i class="fas fa-utensils me-2"></i>Vue Recipes
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link :to="{ name: 'search' }" class="nav-link">
                <i class="fas fa-search me-1"></i>Search
              </router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'about' }" class="nav-link">
                <i class="fas fa-info-circle me-1"></i>About
              </router-link>
            </li>
          </ul>
          <ul class="navbar-nav">
            <!-- Meal Plan Badge -->
            <li class="nav-item me-3" v-if="store.username">
              <router-link :to="{ name: 'mealPlan' }" class="nav-link meal-plan-badge">
                <i class="fas fa-clipboard-list me-1"></i>
                <span class="badge bg-warning text-dark ms-1">{{ mealPlanCount }}</span>
                <span class="d-none d-md-inline ms-1">Meal Plan</span>
              </router-link>
            </li>
            <!-- Guest Greeting -->
            <li class="nav-item me-3" v-if="!store.username">
              <span class="navbar-text guest-greeting">
                <i class="fas fa-user-circle me-1"></i>Hello Guest
              </span>
            </li>
            <li class="nav-item" v-if="!store.username">
              <router-link :to="{ name: 'register' }" class="nav-link">
                <i class="fas fa-user-plus me-1"></i>Register
              </router-link>
            </li>
            <li class="nav-item" v-if="!store.username">
              <router-link :to="{ name: 'login' }" class="nav-link">
                <i class="fas fa-sign-in-alt me-1"></i>Login
              </router-link>
            </li>
            <li class="nav-item dropdown" v-else>
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <i class="fas fa-user me-1"></i>{{ store.username }}
              </a>
              <ul class="dropdown-menu">
                <li><router-link :to="{ name: 'favorites' }" class="dropdown-item">
                  <i class="fas fa-heart me-2"></i>My Favorites
                </router-link></li>
                <li><router-link :to="{ name: 'myRecipes' }" class="dropdown-item">
                  <i class="fas fa-book me-2"></i>My Recipes
                </router-link></li>
                <li><router-link :to="{ name: 'familyRecipes' }" class="dropdown-item">
                  <i class="fas fa-home me-2"></i>Family Recipes
                </router-link></li>
                <li><hr class="dropdown-divider"></li>
                <li><button @click="logout" class="dropdown-item">
                  <i class="fas fa-sign-out-alt me-2"></i>Logout
                </button></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <main class="container-fluid py-4">
      <CreateRecipeModal v-if="showCreateRecipeModal" :forceFamilyRecipe="forceFamilyRecipe" @close="closeCreateRecipeModal" />
      <router-view :openCreateRecipeModal="openCreateRecipeModal" />
    </main>
    <footer class="bg-dark text-light py-4 mt-5">
      <div class="container text-center">
        <p>&copy; 2024 Vue Recipes - Your Family Recipe Collection</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { getCurrentInstance, ref, computed } from 'vue';
import CreateRecipeModal from '@/components/CreateRecipeModal.vue';

export default {
  name: "App",
  components: { CreateRecipeModal },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const toast = internalInstance.appContext.config.globalProperties.toast;
    const router = internalInstance.appContext.config.globalProperties.$router;
    const showCreateRecipeModal = ref(false);
    const forceFamilyRecipe = ref(false);

    // Reactive meal plan count
    const mealPlanCount = computed(() => {
      return store.getMealPlanCount();
    });

    const logout = async () => {
      await store.logout();
      toast("Logout", "User logged out successfully", "success");
      router.push("/").catch(() => {});
    };

    // Open modal, optionally as family recipe
    const openCreateRecipeModal = (asFamily = false) => {
      forceFamilyRecipe.value = asFamily;
      showCreateRecipeModal.value = true;
    };
    const closeCreateRecipeModal = () => {
      showCreateRecipeModal.value = false;
      forceFamilyRecipe.value = false;
    };
    return { 
      store, 
      logout, 
      showCreateRecipeModal, 
      openCreateRecipeModal, 
      closeCreateRecipeModal, 
      forceFamilyRecipe,
      mealPlanCount
    };
  }
}
</script>

<style lang="scss">
@import "@/scss/form-style.scss";
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}

.meal-plan-badge {
  position: relative;
  display: flex;
  align-items: center;
}

.meal-plan-badge .badge {
  font-size: 0.7rem;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.btn {
  border-radius: 25px;
  padding: 0.5rem 1.5rem;
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
}

.recipe-preview-link {
  text-decoration: none;
  color: inherit;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

// Custom dropdown styling
.dropdown-menu {
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  padding: 0.5rem 0;
  z-index: 1050;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  color: #374151;
  transition: all 0.2s ease-in-out;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  text-decoration: none;
  
  &:hover, &:focus {
    background-color: #f3f4f6;
    color: #1f2937;
    transform: translateX(2px);
  }
  
  &:active {
    background-color: #e5e7eb;
  }
  
  i {
    width: 20px;
    text-align: center;
  }
}

.dropdown-divider {
  margin: 0.5rem 0;
  border-top: 1px solid #e5e7eb;
}

// Guest greeting styling
.guest-greeting {
  color: rgba(255, 255, 255, 0.85) !important;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  i {
    opacity: 0.8;
  }
}
</style>
