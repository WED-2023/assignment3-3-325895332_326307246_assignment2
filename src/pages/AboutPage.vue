<template>
  <div class="container about-dark-box py-5 px-4 my-5">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <div class="text-center mb-5">
          <h1 class="title">About Vue Recipes</h1>
        </div>
        <div>
          <template v-if="loading">
            <div class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </template>
          <template v-else-if="aboutData">
            <div class="row">
              <div class="col-12">
                <div class="mb-4">
                  <h3 class="section-title mb-3"><i class="bi bi-info-circle me-2"></i>Project Summary</h3>
                  <p class="lead">{{ aboutData.summary }}</p>
                </div>
                <div class="mb-4">
                  <h3 class="section-title mb-3"><i class="bi bi-people me-2"></i>Development Team</h3>
                  <div class="row">
                    <div v-for="member in aboutData.team" :key="member.name" class="col-md-6 mb-3">
                      <div class="about-member-box h-100 p-4 text-center">
                        <i class="bi bi-person-circle display-6 text-primary"></i>
                        <h5 class="about-member-name mt-2">{{ member.name }}</h5>
                        <p class="about-member-role text-muted mb-1">{{ member.role }}</p>
                        <p class="about-member-email mb-0">
                          <i class="bi bi-envelope me-1"></i>
                          <span class="about-mail-link">{{ getMemberEmail(member) }}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 class="section-title mb-3"><i class="bi bi-folder me-2"></i>Previous Projects</h3>
                  <div class="list-group list-group-flush">
                    <a v-for="project in aboutData.previousProjects" 
                       :key="project.title" 
                       :href="project.url" 
                       target="_blank" 
                       class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">{{ project.title }}</h6>
                        <small class="text-muted">{{ project.url }}</small>
                      </div>
                      <i class="bi bi-arrow-up-right-square"></i>
                    </a>
                  </div>
                </div>
                <div class="d-flex justify-content-center mt-4">
                  <router-link to="/" class="btn btn-primary return-btn">&larr; Return to Recipes</router-link>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="text-center">
              <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
              <h3 class="mt-3">Failed to load information</h3>
              <button @click="fetchAboutData" class="btn btn-primary">
                <i class="bi bi-arrow-clockwise me-2"></i>Try Again
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import store from '../store';

export default {
  name: "AboutPage",
  setup() {
    const aboutData = ref(null);
    const loading = ref(true);

    const fetchAboutData = async () => {
      try {
        loading.value = true;
        const response = await axios.get(`${store.server_domain}/about`);
        aboutData.value = response.data;
      } catch (error) {
        console.error('Failed to fetch about data:', error);
        aboutData.value = null;
      } finally {
        loading.value = false;
      }
    };

    function getMemberEmail(member) {
      if (member.name && member.name.toLowerCase().includes('shahaf')) {
        return 'hartsvis@post.bgu.ac.il';
      } else if (member.name && member.name.toLowerCase().includes('shahar')) {
        return 'navians@post.bgu.ac.il';
      } else if (member.contact) {
        return member.contact;
      } else {
        return 'No email available';
      }
    }

    // Removed unused modal functions

    onMounted(fetchAboutData);

    return { aboutData, loading, fetchAboutData, getMemberEmail };
  }
};
 </script>

<style scoped>
/* About page dark background to match system */
.about-dark-box {
  background: #232b32;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  color: #222;
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
}
.title {
  color: #fff;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2.5rem;
  font-size: 2.5rem;
  text-transform: none;
  letter-spacing: 1px;
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
}
.section-title {
  color: #fff;
  font-weight: 700;
  font-size: 1.5rem;
  text-transform: none;
  letter-spacing: 0.5px;
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
}

/* Return button styling to match system */
.return-btn {
  background-color: #1976d2;
  border: none;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 6px;
  padding: 0.5rem 1.5rem;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
  transition: background 0.2s, color 0.2s;
}
.return-btn:hover {
  background-color: #1565c0;
  color: #fff;
}
.about-member-box {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  color: #23272b;
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  border: none;
}
.about-member-name {
  color: #23272b;
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
  letter-spacing: 0.5px;
}
.about-member-role {
  font-size: 1rem;
  color: #6c757d;
}
.about-member-email {
  font-size: 1rem;
  color: #23272b;
  word-break: break-all;
  margin-top: 0.5rem;
}
.about-mail-link {
  color: #007bff;
  background: none;
  padding: 0;
  border-radius: 0;
  text-decoration: underline;
  font-weight: 600;
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  display: inline-block;
  margin-top: 2px;
}
.about-mail-link:hover {
  color: #0056b3;
  background: none;
  text-decoration: underline;
}
.list-group-item {
  background: #2d3842;
  color: #f8f9fa;
  border: none;
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
}
.list-group-item-action:hover {
  background: #3a4652;
  color: #ffc107;
}
.lead {
  font-size: 1.15rem;
  color: #fff;
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
}
</style>
