<template>
  <section class="hero is-fullheight" v-if="current==='new'">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-mobile is-centered">
          <div class="column is-6" >
            <h2 class="title" style="margin-top: 24px; margin-left:10px" >{{ $t("msg.title") }}
                <span class="is-pulled-right" style="font-size:0.8rem">v{{version}}</span>
            </h2>
            <div class="column">
                <a class="button is-info" @click="current='create'">
                {{ $t("msg.new_.create") }}</a>
              </div>
              <div class="column"><a class="button is-info" @click="current='restore'">
                {{ $t("msg.new_.restore") }}</a>
              </div>
              <div class="column">
                <a class="button is-info is-inverted is-outlined has-text-grey" style="pointer-events: none;">
                  {{ $t("msg.new_.import") }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
  </section>
  <create v-else-if="current === 'create'"></create>
  <restore v-else></restore>
</template>

<script>
import { messageBus } from '@/messagebus'
import Create from '@/components/Create'
import Restore from '@/components/Restore'
import {version} from '../../shared/config'
import walletServiceV3 from '../../shared/walletv3'

export default {
  name: "new",
  components: {
      Create,
      Restore
  },
  data() {
    return {
      current: 'new',
      version: version
    }
  },
  created(){
    messageBus.$on('backToNew', ()=>{
      this.current = 'new'
    })
    if(!this.$walletService.isExist()){
      walletServiceV3.startOwnerApi()
      setTimeout(
        ()=>{
          this.$walletService.initClient()
          walletServiceV3.initClient()
          walletServiceV3.initSharedSecret()
        },
        1500
      )
    }
  }
}
</script>
<style>

</style>
