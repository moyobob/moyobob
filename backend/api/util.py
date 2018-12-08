from .models import Menu, Payment, Party, PartyRecord, User
from websocket.models import PartyState, PartyPhase


def make_payments(state: PartyState, record: PartyRecord):
    payments = []
    for (menu_id, quantity, user_ids) in state.menu_entries.inner.values():
        for user_id in user_ids:
            if user_id == state.paid_user_id:
                continue
            menu = Menu.objects.get(id=menu_id)
            price = (menu.price * quantity) / (len(user_ids))
            payment = Payment(
                user_id=user_id,
                menu=menu,
                price=price,
                party_record_id=record.id,
            )
            if state.paid_user_id:
                payment.paid_user_id = state.paid_user_id
            payments.append(payment)
    Payment.objects.bulk_create(payments)
    return payments


def make_record(state: PartyState):
    if state.phase < PartyPhase.Ordered:
        return None
    state.member_ids = state.member_ids_backup[:]
    party = Party.objects.get(id=state.id)
    record = PartyRecord(
        name=party.name,
        type=party.type,
        location=party.location,
        leader_id=party.leader_id,
        since=party.since,
        restaurant_id=state.restaurant_id,
    )
    if state.paid_user_id:
        record.paid_user_id = state.paid_user_id
    record.save()
    record.members.set(User.objects.filter(id__in=state.member_ids))
    make_payments(state, record)
    return record
