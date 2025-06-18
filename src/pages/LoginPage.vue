<template>
  <div class="login-page">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div class="form-group">
        <label>Username:</label>
        <input v-model="state.username" type="text" class="form-control" />
        <div v-if="v$.username.$error" class="text-danger">
          Username is required.
        </div>
      </div>
      <div class="form-group">
        <label>Password:</label>
        <input v-model="state.password" type="password" class="form-control" />
        <div v-if="v$.password.$error" class="text-danger">
          Password is required (5-10 characters, must include a digit and a special character).
        </div>
      </div>
      <button type="submit" class="btn btn-primary mt-3">Login</button>
    </form>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength } from '@vuelidate/validators';
import { useRouter } from 'vue-router';
import axios from 'axios';
import store from '../store';

const passwordValidator = (value) =>
  /[!@#$%^&*(),.?":{}|<>]/.test(value) && /\d/.test(value);

export default {
  name: "LoginPage",
  setup(_, { expose }) {
    const router = useRouter();
    const state = reactive({
      username: '',
      password: '',
    });

    const rules = {
      username: { required },
      password: { required, minLength: minLength(5), maxLength: maxLength(10), passwordValidator },
    };

    const v$ = useVuelidate(rules, state);

    const login = async () => {
      const isFormCorrect = await v$.value.$validate();
      if (isFormCorrect) {
        try {
          await axios.post(`${store.server_domain}/login`, {
            username: state.username,
            password: state.password
          });
          store.login(state.username);
          router.push('/');
        } catch (err) {
          window.toast("Login failed", err.response.data.message, "danger");
        }
      }
    };

    expose({ login });

    return { state, v$, login };
  }
};
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: auto;
}
</style>
