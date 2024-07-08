<template>
<EaModal
  :visible.sync="visible"
  :close-on-click-modal="false"
  :title="title"
  custom-class="file-upload-dialog"
  width="720px"
  append-to-body>
  <slot name="title" />
  <el-upload
    ref="upload"
    drag
    action="/"
    :multiple="multiple"
    :limit="limit"
    :auto-upload="false"
    :file-list="fileList"
    :on-remove="handleRemove"
    :on-change="handleChange"
    :on-exceed="handleExceed"
    :on-error="httpError"
    :on-success="httpSuccess"
    :http-request="httpRequestMiddleware">
    <i class="el-icon-upload" />
    <div v-if="$scopedSlots.content"><slot name="content" /></div>
    <div v-else class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    <slot name="default" />
  </el-upload>
  <slot name="footer" />
  <template #footer>
    <el-button
      v-if="httpTemplate"
      icon="el-icon-document-copy"
      type="primary"
      plain
      @click="httpTemplateMiddleware">下载模板</el-button>
    <el-button
      icon="el-icon-upload"
      type="primary"
      :loading="loading"
      @click="handleUpload">立即上传</el-button>
    <el-button @click="visible=false">取消</el-button>
  </template>
</EaModal>
</template>

<script>
export default {
  props: {
    title: { type: String, default: '文件上传' },
    multiple: { type: Boolean, default: false },
    limit: { type: Number, default: 1 },
    suffix: { type: String, default: 'xlsx,xls' },
    httpRequest: { type: Function, required: true },
    httpTemplate: { type: Function, default: undefined },
    httpFinally: { type: Function, default: undefined }
  },
  data () {
    return {
      visible: false,
      loading: false,
      fileList: [],
      httpResponse: []
    }
  },
  mounted () {
    this.visible = true
  },
  methods: {
    handleUpload () {
      if (this.fileList.length === 0) {
        return this.$message.info('请选择要上传的文件')
      }
      const strToRegexp = str => {
        if (!str) return new RegExp()
        const arr = str.split(',').filter(m => m).map(m => m.trim())
        return new RegExp('\\.(' + arr.join('|') + ')$')
      }
      const reg = strToRegexp(this.suffix)
      const valid = this.fileList.every(m => reg.test(m.name))
      if (!valid) {
        return this.$message.info('仅支持' + this.suffix + '格式的文件')
      }
      this.$refs.upload.submit()
      this.loading = true
    },
    handleRemove (file, fileList) {
      this.fileList = fileList
    },
    handleChange (file, fileList) {
      this.fileList = fileList
    },
    handleExceed (file, fileList) {
      this.$message.info('单次仅允许上传' + this.limit + '个文件，如需更换文件请先移除一项')
    },
    httpRequestMiddleware (params) {
      return this.httpRequest(params)
    },
    httpTemplateMiddleware () {
      return this.httpTemplate()
    },
    httpError (err, file, fileList) {
      this.httpResponse.push({ file, res: err })
      if (this.httpResponse.length === this.fileList.length) {
        this.httpFinallyMiddleware()
      }
    },
    httpSuccess (res, file, fileList) {
      this.httpResponse.push({ file, res })
      if (this.httpResponse.length === this.fileList.length) {
        this.httpFinallyMiddleware()
      }
    },
    httpFinallyMiddleware () {
      this.visible = false
      this.$emit('done')
      this.httpFinally && this.httpFinally(this.httpResponse)
    }
  }
}
</script>

<style lang="scss">
.file-upload-dialog {
  // 拖拽区域铺满
  .el-upload,
  .el-upload .el-upload-dragger {
    width: 100%;
  }
  // 文件列表项边框
  .el-upload-list {
    .el-upload-list__item {
      border: 1px dashed #aaa;
      .el-icon-close {
        display: inline-block;
      }
    }
  }
  // 清除文件列表变动过渡动画
  .el-list-enter,
  .el-list-enter-active,
  .el-list-enter-to,
  .el-list-leave,
  .el-list-leave-active,
  .el-list-leave-to {
    -webkit-transition: none !important;
    transition: none !important;
  }
}
</style>
