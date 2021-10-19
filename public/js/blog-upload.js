'use-strict'

const Editor = toastui.Editor
const { codeSyntaxHighlight } = Editor.plugin
const blogUploadForm = document.getElementById('blog-upload-form'),
  blogTitleInput = document.getElementById('blog-title-input'),
  blogThumbnailInput = document.getElementById('blog-thumbnail-input'),
  blogThumbnailPreview = document.getElementById('blog-thumbnail-preview'),
  blogTagsInput = document.getElementById('blog-tags-input'),
  blogDescriptionInput = document.getElementById('blog-description-input'),
  blogIsPrivateInput = document.getElementById('blog-is-private-input')

let thumbnailFile,
  title,
  description,
  isPrivate = false,
  tags = []

const uploadImage = async (blob) => {
  try {
    let form = new FormData()
    form.append('image', blob)
    const response = await axios.post('blog/image', form)
    console.log(response.data)
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
      const uploadedImageURL = await uploadImage(blob)
      callback(uploadedImageURL, blob.name) // url, altText
      return false
    },
  },
})

const handleBlogThumbnailChange = ({ target: { files } }) => {
  // input으로 입력받은 파일을 FileReader로 URL로 읽는다.
  // console.log(files);
  thumbnailFile = files[0]
  // console.log(thumbnailFile);
  const reader = new FileReader()
  // 이미지를 브라우저에서 볼 수 있도록 URL로 전달한다.
  reader.readAsDataURL(thumbnailFile)
  reader.onloadend = ({ currentTarget: { result } }) => {
    // 파일에 대한 읽기 동작이 끝났을 때 실행
    // console.log(result);
    const thumbnailFileBase64 = result
    const oldImg = blogThumbnailPreview.firstChild
    if (oldImg) blogThumbnailPreview.removeChild(oldImg)
    const img = document.createElement('img')
    img.src = thumbnailFileBase64
    img.style.width = '424px'
    img.style.height = 'auto'
    blogThumbnailPreview.appendChild(img)
  }
}

const handleBlogTagsChange = ({ target: { value } }) => {
  const tagsString = value
  tags = ['python', 'javascript']
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

const uploadBlog = async (formData) => {
  for (const form of formData.entries()) console.log(form)
  try {
    await axios.post('/blog', formData)
    alert('업로드 성공!')
    location.href = '/'
  } catch (error) {
    if (error?.response?.data?.message) alert(error.response.data.message)
    else alert(error)
  }
}

const handleBlogUploadSubmit = async (event) => {
  event.preventDefault()
  if (window.confirm('업로드 하시겠습니까?')) {
    const html = editor.getHTML()
    if (!html) {
      alert('글을 작성해주세요.')
      return
    }
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('tags', tags)
    formData.append('isPrivate', isPrivate)
    formData.append('thumbnail', thumbnailFile)
    formData.append('contents', html)
    await uploadBlog(formData)
  }
}

function init() {
  blogUploadForm.addEventListener('submit', handleBlogUploadSubmit)
  blogTitleInput.addEventListener('change', handleBlogTitleChange)
  blogThumbnailInput.addEventListener('change', handleBlogThumbnailChange)
  blogTagsInput.addEventListener('change', handleBlogTagsChange)
  blogDescriptionInput.addEventListener('change', handleBlogDescriptionChange)
  blogIsPrivateInput.addEventListener('change', handleBlogIsPrivateChange)
}

init()

function getCookie(name) {
  let matches = document.cookie.match(
    new RegExp(
      '(?:^|; )' +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
        '=([^;]*)',
    ),
  )
  return matches ? decodeURIComponent(matches[1]) : undefined
}
