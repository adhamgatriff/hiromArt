<template>
  <div>
    <p class="Maintitle">Login</p>
    <v-form v-model="valid">
      <v-container >
        <v-layout row wrap>
          <v-flex xs12>
            <v-text-field
              prepend-icon="perm_identity"
              v-model="user"
              :rules="emailRules"
              label="Usuario"
              color="#bc4ecf"
              required
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field
              prepend-icon="vpn_key"
              :type="'password'"
              v-model="password"
              :rules="passRules"
              label="Contraseña"
              color="#bc4ecf"
              required
            ></v-text-field>
          </v-flex>
          <v-flex xs12 text-xs-center>
            <v-btn outline color="white" @click="login">Entrar</v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-form>

    <v-snackbar
      v-model="snackbar"
      :bottom="'bottom'"
      :right="'right'"
      :timeout="3000"
    >
      {{ text }}
      <v-btn
        color="#ce93d8"
        flat
        @click="snackbar = false"
      >
        Cerrar
      </v-btn>
    </v-snackbar>

  </div>
</template> 

<script>

  import firebase from 'firebase/app';  
  import 'firebase/auth';

  export default {
    name: 'login',
    data() {
      return {
        valid: false,
        user: '',
        password: '',
        snackbar: false,
        text: '',
        passRules: [
          v => !!v || 'La contraseña es requerida',
        ],
        emailRules: [
          v => !!v || 'E-mail es requerido',
          v => /.+@.+/.test(v) || 'E-mail debe ser valido'
        ]
      }
    },
    mounted() {
      firebase.auth().onAuthStateChanged(user  => {
        if (user) {
          this.$router.push({ path: '/admin' });
        }
      });
    },
    methods: {
      login() {
        if(this.valid) {
          firebase.auth().signInWithEmailAndPassword(this.user, this.password).then(
            () => {
              this.$router.push({ path: 'admin' });
            },
            (error) => {
              this.text = 'coño, '+ error.message;
              this.snackbar = true;
            }
          )
        } else {
          this.text = 'Los datos ingresados presentan errores hiromota';
          this.snackbar = true;
        }
      }
    }
  }
</script>

<style>
  .Maintitle {
    margin: 5vh 0 0 0;
    font-size: 60px;
    font-weight: 200;
    color: white;
    text-align: center;
  }

  .v-label {
    color: #378bcf;
  }
</style>
