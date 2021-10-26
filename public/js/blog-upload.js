'use-strict'

//* toast-ui editor */
const Editor = toastui.Editor
const { codeSyntaxHighlight } = Editor.plugin
const editorUploadImage = async (blob) => {
  try {
    let form = new FormData()
    form.append('image', blob)
    const response = await axios.post('/blog/v1/image', form)
    return response.data.image
  } catch (error) {
    throw new Error('Server or Network error')
  }
}
const editor = new Editor({
  el: document.querySelector('#editor'),
  height: '80vh',
  initialEditType: 'markdown',
  previewStyle: 'tab',
  plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
  usageStatistics: false,
  viewer: true,
  placeholder: '오늘 하루는 어땠나요?',
  hooks: {
    addImageBlobHook: async (blob, callback) => {
      // blob : Blob | File
      const uploadedImageURL = await editorUploadImage(blob)
      callback(uploadedImageURL, blob.name) // url, altText
      return false
    },
  },
  customHTMLRenderer: {
    htmlBlock: {
      iframe(node) {
        return [
          {
            type: 'openTag',
            tagName: 'iframe',
            outerNewLine: true,
            attributes: node.attrs,
          },
          { type: 'html', content: node.childrenHTML },
          { type: 'closeTag', tagName: 'iframe', outerNewLine: true },
        ]
      },
    },
  },
  customHTMLSanitizer: (html) => {
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
    })
  },
})

//****************************************************************************/

//* document element */
const blogUploadForm = document.getElementById('blog-upload-form'),
  blogTitleInput = document.getElementById('blog-title-input'),
  blogTagsInput = document.getElementById('blog-tags-input'),
  blogDescriptionInput = document.getElementById('blog-description-input'),
  blogIsPrivateInput = document.getElementById('blog-is-private-input')
// blogThumbnailInput = document.getElementById('blog-thumbnail-input'),
// blogThumbnailPreview = document.getElementById('blog-thumbnail-preview'),

//* form data var */
let title,
  description,
  isPrivate = false,
  tags = ''

//* form change event handler */
/*
const handleBlogThumbnailChange = ({ target: { files } }) => {
  thumbnailFile = files[0]
  const reader = new FileReader()
  reader.readAsDataURL(thumbnailFile)
  reader.onloadend = ({ currentTarget: { result } }) => {
    const thumbnailFileBase64 = result
    const oldImg = blogThumbnailPreview.firstChild
    if (oldImg) blogThumbnailPreview.removeChild(oldImg)
    const img = document.createElement('img')
    img.src = thumbnailFileBase64
    img.style.width = '424px'
    img.style.height = 'auto'
    blogThumbnailPreview.appendChild(img)
  }
  // thumbnail file upload using axios
}
*/

const handleBlogTagsChange = ({ target: { value } }) => {
  tags = value
}

const handleBlogDescriptionChange = ({ target: { value } }) => {
  description = value
}

const handleBlogIsPrivateChange = ({ target: { checked } }) => {
  isPrivate = checked
}

const handleBlogTitleChange = ({ target: { value } }) => {
  title = value
}

//* form submit event handler */
const handleBlogUploadSubmit = async (event) => {
  event.preventDefault()
  if (window.confirm('업로드 하시겠습니까?')) {
    const html = editor.getHTML()
    if (!html) {
      alert('글을 작성해주세요.')
      return
    }
    try {
      await axios.post('/blog', {
        title,
        description,
        tags,
        isPrivate,
        contents: html,
      })
      alert('업로드 성공!')
      // location.href = '/'
    } catch (error) {
      if (error?.response?.data?.message) alert(error.response.data.message)
      else alert(error)
    }
  }
}

function init() {
  blogUploadForm.addEventListener('submit', handleBlogUploadSubmit)
  blogTitleInput.addEventListener('change', handleBlogTitleChange)
  blogTagsInput.addEventListener('change', handleBlogTagsChange)
  blogDescriptionInput.addEventListener('change', handleBlogDescriptionChange)
  blogIsPrivateInput.addEventListener('change', handleBlogIsPrivateChange)
  // blogThumbnailInput.addEventListener('change', handleBlogThumbnailChange)
}

init()
