import _chunk from 'lodash/chunk'
import classNames from 'classnames'
import PropTypes, { InferProps } from 'prop-types'
import { AtImagePickerProps, File } from 'types/image-picker'
import { Image, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import AtComponent from '../../common/component'
import { uuid } from '../../common/utils'

interface MatrixFile extends Partial<File> {
  type: 'btn'
  uuid: string
}

// 参照grid，用lodash的_chunk
const generateMatrix = (
  files: MatrixFile[],
  rowLength: number,
  showAddBtn: boolean
) => {
  const matrix = showAddBtn ? [...files, {type: 'btn'}] : files
  return _chunk(matrix, rowLength)
}

const ENV = Taro.getEnv()

export default class AtImagePicker extends AtComponent<AtImagePickerProps> {
  public static defaultProps: AtImagePickerProps
  public static propTypes: InferProps<AtImagePickerProps>

  private chooseFile = (): void => {
    const { files = [], multiple, count, sizeType, sourceType } = this.props
    const filePathName =
      ENV === Taro.ENV_TYPE.ALIPAY ? 'apFilePaths' : 'tempFiles'
    // const count = multiple ? 99 : 1
    const params: any = {}
    if (multiple) {
      params.count = 99
    }
    if (count) {
      params.count = count
    }
    if (sizeType) {
      params.sizeType = sizeType
    }
    if (sourceType) {
      params.sourceType = sourceType
    }
    Taro.chooseImage(params)
      .then(res => {
        const targetFiles = res.tempFilePaths.map((path, i) => ({
          url: path,
          file: res[filePathName][i]
        }))
        const newFiles = files.concat(targetFiles)
        this.props.onChange(newFiles, 'add')
      })
      .catch(this.props.onFail)
  }

  private handleImageClick = (idx: number): void => {
    this.props.onImageClick &&
      this.props.onImageClick(idx, this.props.files[idx])
  }

  private handleRemoveImg = (idx: number): void => {
    const { files = [] } = this.props
    if (ENV === Taro.ENV_TYPE.WEB) {
      window.URL.revokeObjectURL(files[idx].url)
    }
    const newFiles = files.filter((_, i) => i !== idx)
    this.props.onChange(newFiles, 'remove', idx)
  }

  public render(): JSX.Element {
    const {
      className,
      customStyle,
      files,
      mode,
      length = 4,
      showAddBtn = true
    } = this.props
    const rowLength = length <= 0 ? 1 : length
    // 行数
    const matrix = generateMatrix(files as MatrixFile[], rowLength, showAddBtn)
    const rootCls = classNames('at-image-picker', className)

    return (
      <View className={rootCls} style={customStyle}>
        {matrix.map((row, i) => (
          <View className='at-image-picker__flex-box' key={i + 1}>
            {row.map((item, j) =>
              item.url ? (
                <View
                  className='at-image-picker__flex-item'
                  key={i * length! + j}
                >
                  <View className='at-image-picker__item'>
                    <View
                      className='at-image-picker__remove-btn'
                      onClick={this.handleRemoveImg.bind(this, i * length! + j)}
                    ></View>
                    <Image
                      className='at-image-picker__preview-img'
                      mode={mode}
                      src={item.url}
                      onClick={this.handleImageClick.bind(
                        this,
                        i * length! + j
                      )}
                    />
                  </View>
                </View>
              ) : (
                <View
                  className='at-image-picker__flex-item'
                  key={i * length! + j}
                >
                  {item.type === 'btn' && (
                    <View
                      className='at-image-picker__item at-image-picker__choose-btn'
                      onClick={this.chooseFile}
                    >
                      <View className='add-bar'></View>
                      <View className='add-bar'></View>
                    </View>
                  )}
                </View>
              )
            )}
          </View>
        ))}
      </View>
    )
  }
}

AtImagePicker.defaultProps = {
  className: '',
  customStyle: '',
  files: [],
  mode: 'aspectFill',
  showAddBtn: true,
  multiple: false,
  length: 4,
  onChange: () => {},
  onImageClick: () => {},
  onFail: () => {}
}

AtImagePicker.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  customStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  files: PropTypes.array,
  mode: PropTypes.oneOf([
    'scaleToFill',
    'aspectFit',
    'aspectFill',
    'widthFix',
    'top',
    'bottom',
    'center',
    'left',
    'right',
    'top left',
    'top right',
    'bottom left',
    'bottom right'
  ]),
  showAddBtn: PropTypes.bool,
  multiple: PropTypes.bool,
  length: PropTypes.number,
  onChange: PropTypes.func,
  onImageClick: PropTypes.func,
  onFail: PropTypes.func,
  count: PropTypes.number,
  sizeType: PropTypes.array,
  sourceType: PropTypes.array
}
