from datetime import date as Date, datetime, timezone
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

Category = Literal["Food", "Transport", "Housing", "Utilities", "Shopping", "Health", "Entertainment", "Education", "Salary", "Other"]
TxnType = Literal["expense", "income"]
Frequency = Literal["weekly", "monthly", "quarterly", "yearly"]

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TransactionIn(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    amount: float = Field(gt=0, le=100000000)
    type: TxnType = "expense"
    category: Category = "Other"
    date: Date
    note: str = Field(default="", max_length=500)

class TransactionPatch(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=120)
    amount: float | None = Field(default=None, gt=0, le=100000000)
    type: TxnType | None = None
    category: Category | None = None
    date: Date | None = None
    note: str | None = Field(default=None, max_length=500)

class SubscriptionIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    amount: float = Field(gt=0, le=10000000)
    frequency: Frequency = "monthly"
    category: str = Field(default="Entertainment", max_length=80)
    next_billing_date: Date
    active: bool = True

class SubscriptionPatch(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    amount: float | None = Field(default=None, gt=0, le=10000000)
    frequency: Frequency | None = None
    category: str | None = Field(default=None, max_length=80)
    next_billing_date: Date | None = None
    active: bool | None = None
