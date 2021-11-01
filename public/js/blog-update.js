'use-strict'

/* [Global Var]
blogId
blogUploadFormEle
blogTitleInputEle
blogTagsInputEle
blogDescriptionInputEle
blogIsPrivateInputEle
blogInitialContents
blogTitleInputEleDefaultValue
blogTagsInputEleDefaultValue
blogDescriptionInputEleDefaultValue
blogIsPrivateInputEleDefaultValue
blogDeleteBtEle
*/

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
  initialValue: blogInitialContents,
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

//* form data var */
let title = String(blogTitleInputEleDefaultValue),
  description = String(blogDescriptionInputEleDefaultValue),
  isPrivate = Boolean(blogIsPrivateInputEleDefaultValue),
  tags = String(blogTagsInputEleDefaultValue)

//* form change event handler */

const beforeUnloadListener = (event) => {
  event.preventDefault()
  return (event.returnValue = 'Are you sure you want to exit?')
}

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
  if (window.confirm('업데이트 하시겠습니까?')) {
    const markdown = editor.getMarkdown()
    if (!markdown) {
      alert('글을 작성해주세요.')
      return
    }
    try {
      await axios.post(`/blog/update/${blogId}`, {
        title,
        description,
        tags,
        isPrivate,
        contents: markdown,
      })
      window.removeEventListener('beforeunload', beforeUnloadListener, {
        capture: true,
      })
      location.href = document.referrer
    } catch (error) {
      if (error?.response?.data?.message) alert(error.response.data.message)
      else alert(error)
    }
  }
}

const handleBlogDeleteClick = async () => {
  try {
    if (window.confirm('해당 게시물을 삭제할래요?')) {
      await axios.delete(`/blog/${blogId}`)
      window.removeEventListener('beforeunload', beforeUnloadListener, {
        capture: true,
      })
      location.href = '/'
    }
  } catch (error) {
    if (error?.response?.data?.message) alert(error.response.data.message)
    else alert(error)
  }
}

function init() {
  blogUploadFormEle.addEventListener('submit', handleBlogUploadSubmit)
  blogTitleInputEle.addEventListener('change', handleBlogTitleChange)
  blogTagsInputEle.addEventListener('change', handleBlogTagsChange)
  blogDescriptionInputEle.addEventListener(
    'change',
    handleBlogDescriptionChange,
  )
  blogIsPrivateInputEle.addEventListener('change', handleBlogIsPrivateChange)
  blogDeleteBtEle.addEventListener('click', handleBlogDeleteClick)

  // 브라우저 탈출 방지
  window.addEventListener('beforeunload', beforeUnloadListener, {
    capture: true,
  })
}

init()
