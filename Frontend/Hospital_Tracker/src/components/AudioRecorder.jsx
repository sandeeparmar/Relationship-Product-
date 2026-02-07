let mediaRecorder;
let chunks = [];

export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();

  mediaRecorder.ondataavailable = e => chunks.push(e.data);
}

export async function stopRecording(roomId) {
  mediaRecorder.stop();

  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks,{type:"audio/webm"});
    const form = new FormData();
    form.append("audio", blob);
    form.append("roomId", roomId);

    await fetch("http://localhost:5000/api/chat/audio",{
      method:"POST",
      body: form,
      headers:{
        Authorization:`Bearer ${localStorage.getItem("token")}`
      }
    });

    chunks=[];
  };
}
