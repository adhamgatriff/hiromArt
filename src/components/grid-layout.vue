<template>
  <div>
    <section class="container fluid">
        <div v-for="(val, index) of images" :key="index" :class="'item ' + val.elementClasss" @click.stop="openDialog(val)">
          <img :src="val.url" alt="">
        </div>
    </section>
    <v-dialog  v-model="dialog"  max-width="600" >
      <v-card>
        <div style="padding: 5px;">
          <v-img :src="currentUrl" :lazy-src="currentUrl" class="grey lighten-2" >
            <v-layout slot="placeholder" fill-height align-center justify-center ma-0 >
              <v-progress-circular indeterminate color="#ce93d8"></v-progress-circular>
            </v-layout>
          </v-img>
        </div>
        <div style="position: absolute; bottom: 0; width: 100%; background-color: rgba(0,0,0,0.6);">
          <v-layout row wrap style="padding: 10px;">
            <v-flex xs8 style="font-size: 19px; color: white;">
              {{ currentTitle }}
            </v-flex>
            <v-flex xs4 style="font-size: 16px;  color: white; font-weight: 300;">
              {{ currentDate }}
            </v-flex>
            <v-flex xs12 style="color: white; font-size: 13px; font-weight: 300;">
              {{ currentDescription }}
            </v-flex>
          </v-layout>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import firebase from 'firebase/app'; 
import 'firebase/firestore';

export default {
  data() {
    return {
      images: [],
      currentDate: '',
      currentDescription: '',
      currentTitle: '',
      currentUrl: '',
      dialog: false,
    };
  },
  async mounted() {
    this.fetchImages();
  },
  methods: {
    async cargar(drawing) {
      async function getMeta(url){   
          const img = new Image();
          img.src = url;
          function getSize(img){
            return new Promise((resolve)=>{
              img.addEventListener("load", ()=>{
                const data = [img.naturalWidth,img.naturalHeight];
                resolve(data);
              });
            });
          }
          const size = await getSize(img)
          return size;
      }

      const size = await getMeta(drawing.url);
      const elementClasss = this.template(drawing.url, size);

      this.images.push({...drawing, elementClasss});
    },

    template: (url, size) => {
      if (size[1]>size[0]) {
        if (size[1]>(size[0]*2)){
          return 'vertical-l';	
        }else {
          return 'vertical';
        }
      }else if (size[1]==size[0]) {
        return 'square';
      }else if (size[1]<size[0]) {
        return 'horizontal';
      }
    },

    async fetchImages() {
      const db = firebase.firestore();
      db.collection("drawings").orderBy('uid','desc').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          this.cargar(doc.data());
        });
      });
    },
    openDialog(drawing) {
      this.currentDate = drawing.drawDate;
      this.currentDescription = drawing.drawDescription;
      this.currentTitle = drawing.drawTitle;
      this.currentUrl = drawing.url;
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
      this.currentDate = '';
      this.currentDescription = '';
      this.currentTitle = '';
      this.currentUrl = '';
    }
  }
}
</script>

<style scoped>
  .container{
    display: grid;
    grid-template-columns: repeat(auto-fill,250px);
    grid-template-rows:repeat(auto-fill, 250px);
    justify-content: center;
    grid-gap: 10px;
    grid-auto-flow: dense;
  }
  .item {
    cursor: pointer;
    background: #e2e2e2;
    padding: 5px;
  }
  .item img{
    object-fit: cover;
    width: 100%;
    height: 100%;
    vertical-align: top;
  }

  .horizontal{
    grid-column:auto/ span 2;
    grid-row:auto/span 1;
  }
  .horizontal > img {
    height: 240px;
    width: 500px;
  }

  .vertical{
    grid-row:auto/ span 2;
    grid-column:auto/span 1;
  }
  .vertical > img {
    width: 240px;
    height: 500px;
  }

  .square{
    grid-row:auto/span 1;
    grid-column:auto/span 1;
  }
  .square > img{
    width: 240px;
    height: 240px;
  }

  .vertical-l{
    grid-row:auto/span 3;
    grid-column:auto/ span 1;
  }
  .vertical-l > img{
    width: 240px;
    height: 750px;
  }

</style>
