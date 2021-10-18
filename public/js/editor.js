'use-strict'

const Editor = toastui.Editor
const { codeSyntaxHighlight } = Editor.plugin
const submitButton = document.getElementById('submit_bt')

const uploadImage = async (
  // : Blob | File
  blob,
) => {
  try {
    // TODO
    let form = new FormData()
    form.append('image', blob)
    const response = await axios.post(
      'http://localhost:5000/upload/img',
      form,
      { withCredentials: true },
    )
    return response.data.link
  } catch (error) {
    console.error(error)
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
  hooks: {
    addImageBlobHook: async (
      //: Blob | File,
      blob,
      // : (url: string, altText: string) => void,
      callback,
    ) => {
      console.log(blob)
      const uploadedImageURL = await uploadImage(blob)
      callback(uploadedImageURL, 'image name')
      return false
    },
  },
})

const handleSubmitClick = () => {
  const html = editor.getHTML()
  console.log(html)
  console.dir(editor)
  //   console.log(editor.getHTML())
}

submitButton.addEventListener('click', handleSubmitClick)
