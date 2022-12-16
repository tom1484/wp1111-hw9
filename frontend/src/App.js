import './App.css';
import { Button, Input, message, Tabs, Modal, Row, Space } from 'antd';

import { useState, useEffect } from 'react';
import useChat from './hooks/useChat';

import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { CHATROOM_QUERY } from './graphql/queries';

const localStorage = window.localStorage;

function App() {
  const {
    userName, login,
    openChatRoom, createChatRoom,
    removeChatRoom, changeChatRoom,
    chatRoomLoadingStatus,
    chatRoomList, activeRoomIndex,
    sendMessage, clearMessages,
    status, showStatus,
    chatboxBottomRef,
  } = useChat();

  const [title, setTitle] = useState("Chat Room");

  const [loginModalOpen, setLoginModalOpen] = useState(true);
  const [loginInput, setLoginInput] = useState(localStorage.getItem("user"));

  const [addRoomMode, setAddRoomMode] = useState('search');
  const [userListInput, setUserListInput] = useState('')
  const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);
  const [newRoomNameInput, setNewRoomNameInput] = useState("");

  const [messageInput, setMessageInput] = useState("");

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

  useEffect(() => {
    displayStatus(status);
  }, [status]);

  useEffect(() => {
    if (userName === "" || loginModalOpen) {
      setTitle("Chat Room");
    }
    else {
      setTitle(`${userName}'s Chat Room`);
    }
  }, [userName, loginModalOpen]);

  useEffect(() => {
    switch (chatRoomLoadingStatus) {
      case 'loading':
        break
      case 'success':
        setAddRoomModalOpen(false);
        setNewRoomNameInput("");
        setUserListInput("");
        break
      case 'not found':
        setAddRoomMode('create');
        break
      case 'error':
        break
      default:
        break
    }
  }, [chatRoomLoadingStatus]);

  const roomTabOnEdit = (targetIndex, action) => {
    if (action === "add") {
      setAddRoomMode('search');
      setAddRoomModalOpen(true);
    }
    else if (action === "remove") {
      removeChatRoom(targetIndex);
    }
  }

  const messageList = chatRoomList.map(
    (chatRoom, chatRoomKey) => ({
      label: chatRoom.name, key: chatRoomKey,
      closable: true,
      children: (
        <div className="App-messages">
          {
            chatRoom.messages.length === 0 ? (
              <p style={{ color: '#ccc' }}>
                No messages...
              </p>
            ) :
              chatRoom.messages.map(({ sender, content }, index) => {
                return (
                  <div key={index} className='App-message-container'>
                    {
                      sender === userName ? null : (
                        <p className='App-message-sender'>
                          {sender}
                        </p>
                      )
                    }
                    <p className={sender === userName ? 'App-message-right' : 'App-message-left'}>
                      {content}
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
          value={loginInput}
          onChange={(e) => setLoginInput(e.target.value)}
          placeholder="Enter username here..."
          allowClear="true"
          onSearch={() => {
            if (loginInput !== "") {
              login(loginInput);
              setLoginModalOpen(false);
              if (userName !== "") {
                localStorage.setItem("user", userName);
              }
            } else {
              showStatus("error", "Please enter user name");
            }
          }}
        ></Input.Search>
      </Modal>
      <Modal
        title={addRoomMode === 'search' ? "Open Chat Room" : "Create Chat Room"}
        open={addRoomModalOpen}
        closable={true}
        onCancel={() => {
          setAddRoomModalOpen(false)
          setNewRoomNameInput("")
          setUserListInput("")
        }}
        footer={null}
      >
        <Space direction='vertical' style={{ width: "100%" }}>
          {
            addRoomMode === 'create' ? (
              <Input
                placeholder="Enter another user here..."
                value={userListInput}
                onChange={(e) => setUserListInput(e.target.value)}
                allowClear="true"
              >
              </Input>
            ) : null
          }
          <Input.Search
            enterButton="Open"
            placeholder="Enter another user here..."
            value={newRoomNameInput}
            onChange={(e) => {
              if (addRoomMode === 'search') {
                setNewRoomNameInput(e.target.value)
              }
            }}
            onSearch={() => {
              switch (addRoomMode) {
                case 'search':
                  if (newRoomNameInput !== "") {
                    openChatRoom(newRoomNameInput);
                  } else {
                    showStatus("error", "Please enter room name");
                  }
                  break
                case 'create':
                  if (userListInput !== "") {
                    createChatRoom(
                      newRoomNameInput, [
                      userListInput, userName
                    ]);
                  } else {
                    showStatus("error", "Please enter target user name");
                  }
                  break
                default:
                  break
              }
            }}
          ></Input.Search>
        </Space>
      </Modal>
      <div className="App-title">
        <h1>{title}</h1>
        <Button
          type="primary"
          danger
          onClick={clearMessages}
        >
          Clear
        </Button>
      </div>
      <div className="App-messages-container">
        <Tabs
          type="editable-card"
          onChange={
            (newActiveRoomIndex) => changeChatRoom(newActiveRoomIndex)
          }
          activeKey={activeRoomIndex}
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
          sendMessage(messageInput);
          setMessageInput("");
        }}
      ></Input.Search>
    </div >
  );
};

export default App;
