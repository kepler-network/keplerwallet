<template>

<div class="modal" :class="{'is-active': showModal}">
  <div class="modal-background" @click="closeModal"></div>
  <div class="modal-card" style="width:480px">
    <header class="modal-card-head">
      <p class="modal-card-title is-size-4 has-text-info has-text-weight-semibold">{{ $t("msg.send") }}</p>
      <button class="delete" aria-label="close" @click="closeModal"></button>
    </header>
    <section class="modal-card-body" style="height:300px">
      
      <div class="notification is-primary" v-if="errors.length">
        <p v-for="error in errors">{{ error }}</p>
      </div>
      <div class="field">
        <label class="label">{{ $t("msg.fileSend.sendAmount") }}</label>
        <div class="control">
          <input class="input" type="text" v-model="amount" placeholder="1 Ҝ">
        </div>
      </div>

      <br/>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-info" @click="send">{{ $t("msg.fileSend.createTxFile") }}</button>
        </div>
        <div class="control">
          <button class="button is-text" @click="closeModal">{{ $t("msg.cancel") }}</button>
        </div>
      </div>
    </section>
  </div>
</div>

</template>
<script>
import { messageBus } from '@/messagebus'
const fs = require('fs');

export default {
  name: "file-send",
  props: {
    showModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      errors: [],
      amount: null,
      slateVersion: 0
    }
  },
  watch: {
      errors:function(newVal, oldVal){
        if(newVal.length > 0){
          setTimeout(()=>this.errors = [], 
          5*1000)
        }
      },
  },
  methods: {
    validAmount(amount) {
      if(parseFloat(amount) <= 0)return fasle
      let re = /^\d+\.?\d*$/;
      return re.test(amount);
    },
    enough(amount){
      let spendable = this.$dbService.getSpendable()
      if(spendable){
        return spendable >= parseFloat(amount) + 0.01 //0.008
      }
      return false
    },
    checkForm(){
      this.errors = []
      if (!this.amount || !this.validAmount(this.amount)) {
        this.errors.push(this.$t('msg.fileSend.WrongAmount'));
      }
      if (this.amount && this.validAmount(this.amount) && !this.enough(this.amount)) {
        this.errors.push(this.$t('msg.fileSend.NotEnough'));
      }
      if (!this.errors.length) {
        return true;
      }
    },

    send(){
      if(this.checkForm()){
        let fn_output = this.$electron.remote.dialog.showSaveDialog({
          title: this.$t('msg.save'),
          message: this.$t('msg.fileSend.saveMsg'),
        })
        let tx_data = {
          "src_acct_name": null,
          "amount": this.amount * 1000000000, 
          "minimum_confirmations": 10,
          "max_outputs": 500,
          "num_change_outputs": 1,
          "selection_strategy_is_use_all": true,
          "message": null,
          "target_slate_version": null,
          "payment_proof_recipient_address": null,
          "ttl_blocks": null,
          "send_args": null
        }
        this.$walletService.issueSendTransaction(tx_data).then(
          (res) => {
            if (fn_output){
              let slate = res.data.result.Ok
              fs.writeFileSync(fn_output, JSON.stringify(slate))
              this.$walletService.lock_outputs(slate, 0).then(
                (res) =>{
                  this.$log.debug('new send tx file generated')
                  messageBus.$emit('update', true)
                  this.closeModal()
                }).catch((error) => {
                  this.$log.error('error when try to lock output:' + error)
              })
            }
          }).catch((error) => {
            this.$log.error('issueSendTransaction error:' + error)
            this.errors.push(this.$t('msg.fileSend.CreateFailed'))
          })
        }
      },

    closeModal() {
      this.clearup()
      messageBus.$emit('close', 'windowFileSend');
    },
    
    clearup(){
      this.errors = []
      this.amount = null
      this.slateVersion = 0
      this.address = ''
    },
    
  }
}
</script>
<style>
</style>
