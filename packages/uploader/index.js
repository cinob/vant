import { use } from '../utils';
import Icon from '../icon';
import Image from '../image';

const [sfc, bem] = use('uploader');

export default sfc({
  inheritAttrs: false,

  props: {
    preview: Boolean,
    disabled: Boolean,
    uploadText: String,
    beforeRead: Function,
    afterRead: Function,
    accept: {
      type: String,
      default: 'image/*'
    },
    resultType: {
      type: String,
      default: 'dataUrl'
    },
    maxSize: {
      type: Number,
      default: Number.MAX_VALUE
    }
  },

  data() {
    return {
      previewImages: []
    };
  },

  computed: {
    detail() {
      return {
        name: this.$attrs.name || ''
      };
    }
  },

  methods: {
    onChange(event) {
      let { files } = event.target;
      if (this.disabled || !files.length) {
        return;
      }

      files = files.length === 1 ? files[0] : [].slice.call(files, 0);
      if (!files || (this.beforeRead && !this.beforeRead(files, this.detail))) {
        this.resetInput();
        return;
      }

      if (Array.isArray(files)) {
        Promise.all(files.map(this.readFile)).then(contents => {
          let oversize = false;
          const payload = files.map((file, index) => {
            if (file.size > this.maxSize) {
              oversize = true;
            }

            return {
              file: files[index],
              content: contents[index]
            };
          });

          this.onAfterRead(payload, oversize);
        });
      } else {
        this.readFile(files).then(content => {
          this.onAfterRead({ file: files, content }, files.size > this.maxSize);
        });
      }
    },

    readFile(file) {
      return new Promise(resolve => {
        const reader = new FileReader();

        reader.onload = event => {
          resolve(event.target.result);
        };

        if (this.resultType === 'dataUrl') {
          reader.readAsDataURL(file);
        } else if (this.resultType === 'text') {
          reader.readAsText(file);
        }
      });
    },

    onAfterRead(files, oversize) {
      if (oversize) {
        this.$emit('oversize', files, this.detail);
      } else {
        if (Array.isArray(files)) {
          files.forEach(this.addPreviewImage);
        } else {
          this.addPreviewImage(files);
        }

        if (this.afterRead) {
          this.afterRead(files, this.detail);
        }
      }
      this.resetInput();
    },

    addPreviewImage(file) {
      this.previewImages.push(file.content);
    },

    resetInput() {
      /* istanbul ignore else */
      if (this.$refs.input) {
        this.$refs.input.value = '';
      }
    },

    renderPreview() {
      if (this.preview) {
        return this.previewImages.map(image => (
          <Image fit="cover" class={bem('preview')} src={image} />
        ));
      }
    },

    renderUpload() {
      const slot = this.slots();

      const Input = (
        <input
          {...{ attrs: this.$attrs }}
          ref="input"
          type="file"
          accept={this.accept}
          class={bem('input')}
          disabled={this.disabled}
          onChange={this.onChange}
        />
      );

      if (slot) {
        return (
          <div class={bem('input-wrapper')}>
            {slot}
            {Input}
          </div>
        );
      }

      return (
        <div class={bem('upload')}>
          <Icon name="plus" class={bem('upload-icon')} />
          {this.uploadText && <span class={bem('upload-text')}>{this.uploadText}</span>}
          {Input}
        </div>
      );
    }
  },

  render(h) {
    return (
      <div class={bem()}>
        <div class={bem('wrapper')}>
          {this.renderPreview()}
          {this.renderUpload()}
        </div>
      </div>
    );
  }
});