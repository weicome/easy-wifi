<template>
  <!--增加video标签支持，并循环添加-->
  <view :class="node.classStr" :style="node.styleStr">
    <video :class="node.classStr" class="video-video" :src="node.attr.src"></video>
  </view>
</template>

<script>
export default {
  name: 'WxParseVideo',
  props: {
    node: {}
  }
}
</script>
