from .models import Menu, Payment, Party, PartyRecord, User
from websocket.models import PartyState


def make_payments(state: PartyState):
    payments = []
    for (menu_id, quantity, user_ids) in state.menu_entries.inner.values():
        for user_id in user_ids:
            menu = Menu.objects.get(id=menu_id)
            price = (menu.price * quantity) / (len(user_ids))
            payment = Payment(
                user_id=user_id,
                paid_user_id=state.paid_user_id,
                menu=menu,
                price=price,
                resolved=False,
            )
            payments.append(payment)
    for payment in payments:
        payment.save()
    return payments


def make_record(state: PartyState):
    party = Party.objects.get(id=state.id)
    payments = make_payments(state)
    record = PartyRecord(
        name=party.name,
        type=party.type,
        location=party.location,
        leader=party.leader,
        since=party.since,
        members=User.objects.filter(id__in=state.member_ids),
        restaurant_id=state.restaurant_id,
        paid_user_id=state.paid_user_id,
        payments=payments,
    )
    record.save()
