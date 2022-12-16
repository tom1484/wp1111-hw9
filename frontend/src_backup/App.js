import './App.css';
import { Button, Input, message, Tabs, Modal } from 'antd';

import { useState, useEffect } from 'react';
import useChat from './hooks/useChat';

const localStorage = window.localStorage;

function App() {
  const {
    user, setUser, login,
    roomList, openRoom, removeRoom,
    activeRoom, changeRoom,
    status, sendMessage, clearMessages,
    showStatus,
    chatboxBottomRef,
  } = useChat(localStorage.getItem("user"));
  const [loginModalOpen, setLoginModalOpen] = useState(true);
  const [newTargetUser, setNewTargetUser] = useState("");
  const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [title, setTitle] = useState("Chat Room");

  useEffect(() => {
    displayStatus(status)
  }, [status]);

  useEffect(() => {
    if (user === "" || loginModalOpen) {
      setTitle("Chat Room");
    }
    else {
      setTitle(`${user}'s Chat Room`);
    }
  }, [user, loginModalOpen]);

  const displayStatus = (s) => {
    if (s.msg) {
      const { type, msg } = s;
      const content = {
        content: msg, duration: 0.5,
      }
      switch (type) {
        case 'success':
          message.success(content);
          break;
        case 'error':
        default:
          message.error(content);
          break;
      }
    }
  }

  const roomTabOnEdit = (targetKey, action) => {
    if (action === "add") {
      setAddRoomModalOpen(true);
    }
    else if (action === "remove") {
      removeRoom(targetKey);
    }
  }

  const messageList = roomList.map(
    (room, roomKey) => ({
      label: room.targetUser, key: roomKey,
      closable: true,
      children: (
        <div className="App-messages">
          {
            room.messages.length === 0 ? (
              <p style={{ color: '#ccc' }}>
                No messages...
              </p>
            ) :
              room.messages.map(({ name, message }, index) => {
                return (
                  <div key={index} className='App-message-container'>
                    <p className={name === user ? 'App-message-right' : 'App-message-left'}>
                      {message}
                    </p>
                  </div>
                );
              })
          }
          <div ref={chatboxBottomRef} />
        </div>
      )
    })
  )

  return (
    <div className="App">
      <Modal
        title="Login"
        open={loginModalOpen}
        footer={null}
      >
        <Input.Search
          enterButton="Login"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Enter username here..."
          allowClear="true"
          onSearch={(username) => {
            if (username !== "") {
              login(username);
              setLoginModalOpen(false);
              if (user !== "") {
                localStorage.setItem("user", user);
              }
            }
            else {
              showStatus("error", "Please enter user name");
            }
          }}
        ></Input.Search>
      </Modal>
      <Modal
        title="Open New Chat"
        open={addRoomModalOpen}
        footer={null}
      >
        <Input.Search
          enterButton="Open"
          placeholder="Enter another user here..."
          value={newTargetUser}
          onChange={(e) => setNewTargetUser(e.target.value)}
          onSearch={(val) => {
            if (val !== "") {
              openRoom(newTargetUser);
              setAddRoomModalOpen(false);
              setNewTargetUser("");
            }
            else {
              showStatus("error", "Please enter another user");
            }
          }}
        ></Input.Search>
      </Modal>
      <div className="App-title">
        <h1>{title}</h1>
        <Button type="primary" danger onClick={clearMessages}>
          Clear
        </Button>
      </div>
      <div className="App-messages-container">
        <Tabs
          type="editable-card"
          onChange={(newActiveRoom) => changeRoom(newActiveRoom)}
          activeKey={activeRoom}
          onEdit={roomTabOnEdit}
          items={messageList}
        >
        </Tabs>
      </div >
      <Input.Search
        enterButton="Send"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        placeholder="Type a message here..."
        onSearch={(msg) => {
          sendMessage({ name: user, message: messageInput });
          setMessageInput("");
        }}
      ></Input.Search>
    </div >
  );
};

export default App;
