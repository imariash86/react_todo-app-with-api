/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect } from 'react';
import { UserWarning } from './UserWarning';
import {
  getTodos,
  addTodo,
  deleteTodo,
  completedTodo,
  updateTodoTitle,
} from './api/todos';
import { Todo } from './types/Todo';
import { Header } from './components/Header/Header';
import { TodoList } from './components/TodoList/TodoList';
import { Footer } from './components/Footer/Footer';
import { FilterBy } from './types/FilterBy';
import { Notification } from './components/Notification';

const USER_ID = 6259;

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterBy, setFilterBy] = useState<FilterBy>(FilterBy.All);
  const [isError, setIsError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [todoTitle, setTodoTitle] = useState('');
  const [disableInput, setDisableInput] = useState(false);
  const [editingTodosId, setEditingTodosId] = useState<number[]>([]);
  const [formShowedForId, setFormShowedForId] = useState(0);

  const getAllTodos = async () => {
    try {
      setDisableInput(true);
      const data = await getTodos(USER_ID);

      setTodos(data);
      setDisableInput(false);
    } catch (error) {
      setErrorText('Error with loading todos');
      setIsError(true);
      throw new Error('Error with loading todos');
    }
  };

  useEffect(() => {
    getAllTodos();
  }, []);

  const handleAddTodo = async (todoText: string) => {
    if (todoTitle.length === 0) {
      setIsError(true);
      setErrorText('Title can\'t be empty');

      return;
    }

    const newTodoBody = {
      id: 0,
      title: todoText,
      userId: USER_ID,
      completed: false,
    };

    try {
      setDisableInput(true);
      setTodoTitle('');
      await addTodo(USER_ID, newTodoBody);
      getAllTodos();
    } catch {
      setIsError(true);
      setErrorText('Unable to add a todo');
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    setEditingTodosId(cur => [...cur, todoId]);
    try {
      setDisableInput(true);
      await deleteTodo(USER_ID, todoId);
      getAllTodos();
    } catch {
      setIsError(true);
      setErrorText('Unable to delete a todo');
    }

    setEditingTodosId(cur => cur.filter(id => id !== todoId));
  };

  const handleCompletedTodo = async (todoId: number, toggle: boolean) => {
    const completed = !toggle;

    setEditingTodosId(cur => [...cur, todoId]);
    try {
      setDisableInput(true);
      await completedTodo(USER_ID, todoId, { completed });
      getAllTodos();
    } catch {
      setIsError(true);
      setErrorText('Unable to update a todo');
    }

    setEditingTodosId(cur => cur.filter(id => id !== todoId));
  };

  const handleDeleteCompleted = () => {
    const completedTodosId = todos
      .filter(todo => todo.completed === true).map(todo => todo.id);

    completedTodosId.forEach(todoId => handleDeleteTodo(todoId));
  };

  const handleUpdateTodoTitle = async (
    todoId: number,
    newTitle: string,
  ) => {
    setEditingTodosId(cur => [...cur, todoId]);
    try {
      setDisableInput(true);
      await updateTodoTitle(USER_ID, todoId, { title: newTitle });
      getAllTodos();
    } catch {
      setIsError(true);
      setErrorText('Unable to update a todo title');
    }

    setEditingTodosId([]);
  };

  const toggleAll = async () => {
    todos.forEach(todo => handleCompletedTodo(todo.id, todo.completed));
  };

  const hasCompletedTodos = todos.some(todo => todo.completed === true);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const todoTitleChange = (value: string) => {
    setTodoTitle(value);
  };

  const closeError = () => {
    setIsError(false);
  };

  const showForm = (todoId: number) => {
    setFormShowedForId(todoId);
  };

  const changeFilter = (selectedFilter: FilterBy) => {
    setFilterBy(selectedFilter);
  };

  const hasActiveTodos = todos.some(todo => !todo.completed);

  let filteredTodos = todos;

  switch (filterBy) {
    case FilterBy.Active:
      filteredTodos = todos.filter(todo => todo.completed === false);
      break;
    case FilterBy.Complited:
      filteredTodos = todos.filter(todo => todo.completed === true);
      break;
    case FilterBy.All:
    default:
      filteredTodos = todos;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">

        <Header
          hasActiveTodos={hasActiveTodos}
          todoTitle={todoTitle}
          todoTitleChange={todoTitleChange}
          handleAddTodo={handleAddTodo}
          disableInput={disableInput}
          toggleAll={toggleAll}
        />

        <TodoList
          todos={filteredTodos}
          handleDeleteTodo={handleDeleteTodo}
          handleComplitedTodo={handleCompletedTodo}
          disableInput={disableInput}
          editingTodosId={editingTodosId}
          formShowedForId={formShowedForId}
          showForm={showForm}
          handleUpdateTodoTitle={handleUpdateTodoTitle}
        />

        {todos.length !== 0
        && (
          <Footer
            changeFilter={changeFilter}
            itemsCounter={filteredTodos.length}
            hasCompletedTodos={hasCompletedTodos}
            handleDeleteCompleted={handleDeleteCompleted}
          />
        )}

      </div>

      <Notification
        isError={isError}
        errorText={errorText}
        closeError={closeError}
      />

    </div>
  );
};
