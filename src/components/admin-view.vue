<template>
  <div>
    <v-container>
      <v-layout row wrap>
        <v-flex sm9>
          <p class="Maintitle">Administrador</p>
        </v-flex>
        <v-flex sm3 style="margin: 9vh auto;">
          <v-btn outline color="white" @click="logout">salir</v-btn>
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex md8 offset-md2 sm12>
          <v-data-table :headers="headers" :items="drawings" class="elevation-1"  :rows-per-page-items="rowsPerPageItems" :pagination.sync="pagination">
            <template slot="items" slot-scope="props">
              <td>{{ props.item.drawTitle }}</td>
              <td class="text-xs-right">{{ props.item.drawDate }}</td>
              <td class="text-xs-right">{{ props.item.drawDescription }}</td>
              <td class="justify-center layout px-0">
                <v-icon small class="mr-2" @click="showImage(props.item.url, props.item.drawTitle)">photo</v-icon>
                <v-icon small class="mr-2" @click="editItem(props.item)">edit</v-icon>
                <v-icon small class="mr-2" @click="showDeleteModal(props.item)">delete</v-icon>
              </td>
            </template>
            <template slot="no-data">
              <p style="text-align: center;"> no hay dibujos para mostrar</p>
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-btn slot="activator" color="pink" dark absolute bottom right fab>
        <v-icon>add</v-icon>
      </v-btn>
      <v-card>
        <v-card-title v-show="!upladingImage">
          <span class="headline">Agregar nuevo dibujo</span>
        </v-card-title>
        <v-card-title v-show="upladingImage">
          <span class="headline">Subiendo la imagen, espera hiromita</span>
        </v-card-title>
        <v-card-text v-show="!upladingImage">
          <v-form v-model="validm">
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md6>
                  <v-text-field label="Titulo del dibujo" required :rules="requiredRule" v-model="drawTitle" color="#bc4ecf"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md6>
                  <v-text-field label="Fecha de creacion" required :rules="requiredRule" v-model="drawDate" color="#bc4ecf"></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field label="Descripcion" required :rules="requiredRule"  v-model="drawDescription" color="#bc4ecf"></v-text-field>
                </v-flex>
                <v-flex xs12 style="margin-top: 5px;">
                  <input type="file" name="upload" id="upload" class="upload-box" placeholder="Sube un archivo">
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-text  v-show="upladingImage">
          <v-container grid-list-md>
            <v-layout fill-height align-center justify-center ma-0 >
              <v-progress-circular :rotate="-90" :size="100" :width="15" :value="percentUpload" color="#bc4ecf" >
                {{ percentUpload + '%' }}
              </v-progress-circular>
            </v-layout>
            <v-layout align-center justify-center mt-4>
              <v-btn color="blue darken-1" flat @click="pauseUpload" v-show="!upladingPaused">Pausar carga</v-btn>
              <v-btn color="blue darken-1" flat @click="resumeUpload" v-show="upladingPaused">Reanudar carga</v-btn>
              <v-btn color="blue darken-1" flat @click="cancelUpload" v-show="!upladingPaused">Cancelar carga</v-btn>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions v-show="!upladingImage">
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="closeDialog">Cerrar</v-btn>
          <v-btn color="blue darken-1" flat @click="submitDraw">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="imageDialog" max-width="450" >
      <v-card>
        <v-card-title class="headline">{{currentImageTitle}}</v-card-title>
        <v-card-text>
          <v-img :src="currentImage" :lazy-src="currentImage" aspect-ratio="1" class="grey lighten-2" >
            <v-layout slot="placeholder" fill-height align-center justify-center ma-0 >
              <v-progress-circular indeterminate color="#ce93d8"></v-progress-circular>
            </v-layout>
          </v-img>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="#ce93d8" flat="flat" @click="imageDialog = false"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteDialog" max-width="550" >
      <v-card>
        <v-card-title class="headline">
          ¿En serio quieres borrar el dibujo {{ currentImageTitle }}?.
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="#ce93d8" flat="flat"  @click="deleteDialog = false" >
            Cancelar
          </v-btn>
          <v-btn color="#ce93d8" flat="flat" @click="deleteItem()" >
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :bottom="'bottom'" :right="'right'" :timeout="3000" >
      {{ text }}
      <v-btn color="#ce93d8" flat @click="snackbar = false"> Cerrar</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
  import firebase from 'firebase/app';  
  import 'firebase/storage';
  import 'firebase/auth';
  import 'firebase/firestore';

  export default {
    data: () => ({
      drawings: [],
      headers: [
        { text: 'Titulo del dibujo', value: 'name'},
        { text: 'fecha de creacion', value: 'date' },
        { text: 'descripcion', value: 'description' },
        { text: 'Actions', value: 'name', sortable: false }
      ],
      dialog: false,
      edit: false,
      deleteDialog: false,
      upladingImage: false,
      imageDialog: false,
      upladingPaused: false,
      percentUpload: 0,
      currentImage: '',
      currentImageTitle: '',
      currentUid: '',
      snackbar: false,
      menu: false,
      text: '',
      validm: false,
      drawTitle: '',
      drawDate: new Date().toISOString().substr(0, 10),
      drawDescription: '',
      requiredRule: [
        v => !!v || 'El campo es requerido',
      ],
      task: null,
      rowsPerPageItems: [10, 20, 30, 40],
      pagination: {
          rowsPerPage: 10
      },
    }),
    mounted() {
      if(!firebase.auth().currentUser) {
        this.$router.push({ path: '/login' });
      } else {
        this.initiateTable();
      }
    },
    methods: {
      initiateTable() {
        const db = firebase.firestore();
        const data = [];

        db.collection("drawings").get().then(querySnapshot => {
          querySnapshot.forEach(doc => {
            data.push(doc.data());
          });
          this.drawings = data;
        });
      },
      submitDraw() {
        const db = firebase.firestore();
        const ref = firebase.storage().ref();
        const file = document.querySelector('#upload');

        const uid = this.edit ? this.currentUid : String(+new Date());

        if(this.validm) {
          if(file.value !== "") {

            this.task = ref.child(uid).put(file.files[0], { contentType: file.type });

            this.upladingImage = true;
            this.task.on('state_changed', snapshot => {
              let progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              this.percentUpload = progress;

              if (firebase.storage.TaskState.RUNNING) this.upladingPaused = false;

            }, e => {
              this.upladingImage = false;
              this.text = 'coño, nº1 '+ e.message;
              this.snackbar = true;
            }, () =>  {
              this.task.snapshot.ref.getDownloadURL().then((downloadURL) => {
                db.collection("drawings").doc(uid).set({
                  uid,
                  drawTitle: this.drawTitle,
                  drawDate: this.drawDate,
                  drawDescription: this.drawDescription,
                  url: downloadURL
                })
                .then(() => {
                  this.text = 'Imagen agregada correctamente';
                  this.snackbar = true;
                  this.closeDialog();
                  this.upladingImage = false;
                  this.initiateTable();
                })
                .catch(e => {
                  this.upladingImage = false;
                  this.text = 'coño, nº2 '+ e.message;
                  this.snackbar = true;
                })
              });
            });
          } else {
            this.text = 'No agregastes ninguna imagen hiromota';
            this.snackbar = true;
          }
        } else {
          this.text = 'Los datos ingresados presentan errores hiromota';
          this.snackbar = true;
        }
      },
      editItem(item) {
        this.edit = true;
        this.currentUid = item.uid
        this.drawTitle = item.drawTitle;
        this.drawDate = item.drawDate;
        this.drawDescription = item.drawDescription;
        this.dialog = true;
      },
      showDeleteModal(item) {
        this.deleteDialog = true;
        this.currentImageTitle = item.drawTitle;
        this.currentUid = item.uid;
      },
      deleteItem() {
        firebase.storage().ref().child(this.currentUid).delete()
        .then(() => {
          firebase.firestore().collection("drawings").doc(this.currentUid).delete().then(() => {
            this.initiateTable();
            this.deleteDialog = false;
            this.currentUid = '';
            this.currentImageTitle = '';
            this.text = 'Dibujo eliminado correctamente';
            this.snackbar = true;
          }).catch(e => {
            this.deleteDialog = false;
            this.currentUid = '';
            this.currentImageTitle = '';
            this.text = 'coño, nº4 '+ e.message;
            this.snackbar = true;
          });
        }).catch(e => {
          this.deleteDialog = false;
          this.currentUid = '';
          this.currentImageTitle = '';
          this.text = 'coño, nº3'+ e.message;
          this.snackbar = true;
        });
      },
      pauseUpload() {
        if(this.task) {
          this.task.pause();
          this.upladingPaused = true;
        }
      },
      resumeUpload() {
        if(this.task) {
          this.task.resume();
        }
      },
      cancelUpload() {
        if(this.task) {
          this.task.cancel();
        }
      },
      showImage(url, title) {
        this.currentImage = url;
        this.currentImageTitle = title;
        this.imageDialog = true;
      },
      closeDialog() {
        this.dialog = false;
        this.edit = false;
        this.drawTitle = '';
        this.drawDescription = '';
        this.drawDate = new Date().toISOString().substr(0, 10);
        document.getElementById("upload").value = "";
      },
      logout() {
        firebase.auth().signOut().then(() => {
          this.$router.push({ path: '/' });
        });
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

  .v-btn--bottom.v-btn--absolute {
    bottom: 20px !important;
  }
</style>
