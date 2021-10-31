'use-strict'

//* global var : initialValue

//* toast-ui editor */
const Editor = toastui.Editor
const { codeSyntaxHighlight } = Editor.plugin
const editorUploadImage = async (blob) => {
  alert('준비중인 기능입니다.')
  throw new Error('준비중인 기능입니다.')
  //   try {
  //     let form = new FormData()
  //     form.append('image', blob)
  //     const response = await axios.post('...', form)
  //     return response.data.image
  //   } catch (error) {
  //     throw new Error('Server or Network error')
  //   }
}
const editor = new Editor({
  el: document.querySelector('#editor'),
  height: '80vh',
  initialEditType: 'markdown',
  previewStyle: 'tab',
  plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
  usageStatistics: false,
  viewer: true,
  placeholder: '소개글을 작성해주세요.',
  initialValue,
  hooks: {
    addImageBlobHook: async (blob, callback) => {
      const uploadedImageURL = await editorUploadImage(blob)
      callback(uploadedImageURL, blob.name)
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
const profileUploadForm = document.getElementById('blog-upload-form')

//* form submit event handler */
const handleUploadSubmit = async (event) => {
  event.preventDefault()
  if (window.confirm('업로드 하시겠습니까?')) {
    const html = editor.getHTML()
    try {
      await axios.post('/users/v1/update', {
        contents: html,
      })
      alert('업로드 성공!')
      location.href = '/profile'
    } catch (error) {
      if (error?.response?.data?.message) alert(error.response.data.message)
      else alert(error)
    }
  }
}

function init() {
  profileUploadForm.addEventListener('submit', handleUploadSubmit)
}

init()
