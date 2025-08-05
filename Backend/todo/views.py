from django.shortcuts import render
from rest_framework.decorators import api_view
from .models import TodoItem
from .serializers import TodoItemSerializer
from rest_framework.response import Response
from rest_framework import status
# Create your views here.
@api_view(['GET'])
def todo_list(request):
    """
    List all todo items.
    """
    todos = TodoItem.objects.all()
    serializer = TodoItemSerializer(todos, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def add_todo(req):
    serializer = TodoItemSerializer(data=req.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data , status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_todo(req, pk):
    try:
        todo = TodoItem.objects.get(pk=pk)
    except TodoItem.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    # Update fields manually
    if 'completed' in req.data:
        todo.completed = req.data['completed']
    if 'title' in req.data:
        todo.title = req.data['title']
    if 'description' in req.data:
        todo.description = req.data['description']

    todo.save()
    serializer = TodoItemSerializer(todo)
    return Response(serializer.data)

    
@api_view(['DELETE'])
def delete_todo(req,pk):
    try:
        todo = TodoItem.objects.get(pk=pk)
    except TodoItem.DoesNotExist:

        return Response(status=status.HTTP_404_NOT_FOUND)
    todo.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
