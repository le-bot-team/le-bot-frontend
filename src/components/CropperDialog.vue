<script setup lang="ts">
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { ref } from 'vue';
import { Cropper, RectangleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

import { i18nSubPath } from 'src/utils/common';

const props = defineProps<{
  src?: string | undefined;
}>();
defineEmits(useDialogPluginComponent.emitsObject);

const i18n = i18nSubPath('components.CropperDialog');

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { notify } = useQuasar();

const image = ref(props.src);
const imageFiles = ref<File>();
const cropper = ref<typeof Cropper>();

const onConfirm = () => {
  const croppedImage = cropper.value?.getResult()?.canvas.toDataURL();
  if (croppedImage) {
    onDialogOK(croppedImage);
  } else {
    notify({
      type: 'negative',
      message: i18n('notifications.noImageToProcess'),
    });
  }
};

const onFileChange = (file: File) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    console.log(event);
    if (!event.target?.result || typeof event.target.result !== 'string') {
      return;
    }
    image.value = event.target.result.toString();
  };
  reader.readAsDataURL(file);
};

const onRejected = () => {
  notify({
    type: 'negative',
    message: i18n('notifications.invalidFile'),
  });
};
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin hide-scrollbar" style="max-width: 90vw">
      <q-card-section>
        <div class="text-h6">
          {{ i18n('labels.title') }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-file
          class="ellipsis"
          accept="image/*"
          :label="i18n('labels.chooseImage')"
          name="avatarFile"
          outlined
          v-model="imageFiles"
          @rejected="onRejected"
          @update:model-value="onFileChange"
        />
      </q-card-section>
      <q-separator />
      <q-card class="q-ma-sm" flat>
        <q-responsive :ratio="1">
          <div v-if="!image" class="row justify-center absolute-full">
            <div class="self-center text-h6 text-grey text-italic text-weight-medium text-center">
              {{ i18n('labels.noImage') }}
            </div>
            <div class="row justify-center absolute-top">
              <q-icon color="grey" name="north" size="6rem" />
            </div>
          </div>
          <Cropper ref="cropper" :src="image" :stencil-component="RectangleStencil" />
        </q-responsive>
      </q-card>
      <q-separator />
      <q-card-section>
        <div class="row justify-between">
          <q-btn
            icon="mdi-flip-horizontal"
            padding="0.5rem"
            size="0.75rem"
            outline
            @click="cropper?.flip(true, false)"
          />
          <q-btn
            icon="mdi-flip-vertical"
            padding="0.5rem"
            size="0.75rem"
            outline
            @click="cropper?.flip(false, true)"
          />
          <q-btn
            icon="mdi-rotate-left"
            padding="0.5rem"
            size="0.75rem"
            outline
            @click="cropper?.rotate(-90)"
          />
          <q-btn
            icon="mdi-rotate-right"
            padding="0.5rem"
            size="0.75rem"
            outline
            @click="cropper?.rotate(90)"
          />
          <q-btn
            icon="mdi-magnify-minus-outline"
            padding="0.5rem"
            size="0.75rem"
            outline
            @click="cropper?.zoom(0.5)"
          />
          <q-btn
            icon="mdi-magnify-plus-outline"
            padding="0.5rem"
            size="0.75rem"
            outline
            @click="cropper?.zoom(2)"
          />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row justify-end q-gutter-x-md">
          <q-btn :label="i18n('labels.cancel')" flat no-caps @click="onDialogCancel" />
          <q-btn
            color="primary"
            :label="i18n('labels.confirm')"
            no-caps
            unelevated
            @click="onConfirm"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
